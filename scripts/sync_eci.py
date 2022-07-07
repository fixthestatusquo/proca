#!/usr/bin/env python3


"""
A script to sync ECI campaign and it's pages with default API

Configure:
- AUTH_USER
- AUTH_PASSWORD
- ORG_NAME - for the org holding campaign

- talks to local api

"""

from gql import gql, Client

from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.phoenix_channel_websockets import PhoenixChannelWebsocketsTransport
from aiohttp.helpers import BasicAuth
from logging import  getLogger, DEBUG, INFO, StreamHandler
from os import environ
from subprocess import call
from sys import argv
import json
import sentry_sdk

if 'SENTRY_DSN' in environ:
    sentry_sdk.init(environ['SENTRY_DSN'], traces_sample_rate=1.0)


log = getLogger("proca")
log.addHandler(StreamHandler())

log.setLevel(DEBUG)

#DEST_API='http://localhost:4000/api'
DEST_API="http://localhost:4001/private/api"

AUTH_USER=environ['AUTH_USER']
AUTH_PASSWORD=environ['AUTH_PASSWORD']
# so we do not propagate it when executing subcommands
del environ['AUTH_USER']
del environ['AUTH_PASSWORD']

def upsert(org_name, campaign_name, ap_attrs, campaign_attrs):
    auth=BasicAuth(AUTH_USER, AUTH_PASSWORD)
    transport = AIOHTTPTransport(url=DEST_API, auth=auth)
    client = Client(transport=transport)

    query = gql(
        """
mutation AddPage($org:String!, $campaignName:String!, $config: Json!, $page:ActionPageInput!) {
  upsertCampaign(orgName:$org, input:{
        title: "Stop Settlements",
    name:$campaignName,
    config: $config,
    actionPages:[$page]
  }) {
    ... on PrivateCampaign{
      actionPages {name id}
    }
  }
}
        """
    )

    d = client.execute(query, variable_values={
        'org': org_name,
        'campaignName': campaign_name,
        'page': ap_attrs,
        'config': campaign_attrs['config']
    })
    print(d)
    if 'errors' in d:
        log.error(f"Cannot add page: {d['errors']}")
        return None
    if 'upsertCampaign' in d:
        pages = d['upsertCampaign']['actionPages']

        return [p for p in pages if p['name'] == ap_attrs['name']][0]




def sync(campaign_name):
    #transport = AIOHTTPTransport(url="https://api.proca.app/api")
    transport = PhoenixChannelWebsocketsTransport(url="wss://api.proca.app/socket/websocket")

    client = Client(transport=transport)

    query = gql(
    """
    subscription Pages {
    actionPageUpserted {
        id name locale
        campaign { name config }
        config
    }
    }
    """
    )

    x = client.subscribe(query)

    for d in x:
        log.debug('upsert AP data', d)
        if 'actionPageUpserted' in d:
            ap = d['actionPageUpserted']
            if ap['campaign']['name'] == campaign_name:
                with sentry_sdk.start_transaction() as t:
                    t.name = ap['name']
                    sync_ap(ap, campaign_name)
            else:
                log.debug(f'Ignoring page of campaign {ap["campaign"]["name"]}')

        else:
            log.info(f"data with no actionPageUpserted {d}")

def sync_ap(ap, campaign_name):
    ap_id = ap['id']
    ap_name = ap['name']
    log.info(f"Sync action page {ap_name}")

    page = {
        'name': ap_name,
        'locale': ap['locale']
    }

    campaign = {
        "config": ap['campaign']['config']
    }

    page2 = upsert(environ['ORG_NAME'], campaign_name, page, campaign)
    log.info(f'Synced {page2["name"]} id {page2["id"]}')

    with sentry_sdk.start_span() as s:
        s.description=f'fetch {ap["name"]}'
        fetch(ap_id)

    patch(ap_id, page2['id'])

    with sentry_sdk.start_span() as s:
        s.description=f'build {ap["name"]}'
        build(ap_id)

def fetch(ap_id):
    call(f"/usr/bin/docker exec widgetbuilder yarn pull {ap_id}".split(' '))


def build(ap_id):
    call(f"/usr/bin/docker exec widgetbuilder yarn build {ap_id}".split(' '))

def patch(ap_id, eci_ap_id):
    fn = f'config/{ap_id}.json'

    conf = json.load(open(fn))

    c = conf
    for p in ['component', 'eci']:
        if p not in c:
            c[p] = {}

        c = c[p]
    c['actionpage'] = eci_ap_id
    json.dump(conf, open(fn, 'w'), indent=2)





if __name__ == "__main__":

    try:
        sync(argv[1])
    except IndexError:
        print(f'Usage: {argv[0]} campaign_name')

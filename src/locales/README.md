trying to use most of the strings from the mozilla plateform

https://github.com/mozilla-l10n/donate-l10n

then convert to json using i18next-gettext-converter

i18next-conv -l fr -s /usr/src/donate-l10n/donate/locale/fr/LC_MESSAGES/django.po -t /tmp/fr.json

or better, using code and filter:

const path = require('path');
const { readFileSync, writeFileSync } = require('fs');
const {
i18nextToPo,
i18nextToPot,
i18nextToMo,
gettextToI18next,
} = require('i18next-conv');

const source = path.join(__dirname, '../locales/ua-UK/translation.json');
const options = {/* you options here */}

function save(target) {
return result => {
writeFileSync(target, result);
};
}

i18nextToPo('ua-UK', readFileSync(source), options).then(save('../locales/ua-UK/translation.po'));
i18nextToPot('ua-UK', readFileSync(source), options).then(save('../locales/ua-UK/translation.pot'));
i18nextToMo('ua-UK', readFileSync(source), options).then(save('../locales/ua-UK/translation.mo'));

gettextToI18next('ua-UK', readFileSync('../locales/ua-UK/translation.po'), options)
.then(save('../locales/ua-UK/translation.json'));

~

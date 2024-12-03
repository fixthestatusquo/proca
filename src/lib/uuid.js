/*
 * Sometimes, we need a uniqueid /fingerprint without collecting any personal data or any interaction with the server
 *
 * we generate a RFC 4122 uuid (v4) https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
 * and base64url encode it (a url friendly base64 encoding)
 */
import { encode } from "universal-base64url";
import { v4 as uuid } from "uuid";

let id = null;

const isSet = () => id !== null;

function generate() {
  const d = [];
  uuid(null, d); // as buffer
  id = encode(d);
  return id;
}

const reset = () => {
  id = generate();
  return id;
};
// @input set null=generate or return previous, false=return if uuid is set or not, string or array = set the uuid
const getuuid = set => {
  if (typeof set === "undefined") {
    return id ? id : generate();
  }
  if (typeof set === "string") {
    id = set;
    return id;
  }

  return id;
};

export default getuuid;
export { reset, getuuid as uuid, isSet };

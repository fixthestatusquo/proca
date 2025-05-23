export const getHash = async key => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  if (!crypto.subtle) {
    console.error("crypto.subtle missing, it needs https");
    return undefined;
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
};

export const binaryToBase64 = binary => btoa(String.fromCharCode(...binary));
export const base64ToBinary = base64 =>
  new Uint8Array(
    atob(base64)
      .split("")
      .map(x => x.charCodeAt(0))
  );

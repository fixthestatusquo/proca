export const binaryToBase64 = binary => btoa(String.fromCharCode(...binary));
export const base64ToBinary = base64 =>
  new Uint8Array(
    atob(base64)
      .split("")
      .map(x => x.charCodeAt(0))
  );

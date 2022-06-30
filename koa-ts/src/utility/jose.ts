import * as jose from "jose";

export const signJwt = (id: string, name: string, email: string, phone: string) => {
    const jwt = new jose.UnsecuredJWT({ id, name, email, phone })
        .setIssuedAt()
        .setIssuer("urn:ovaphlow:crate:issuer")
        .setAudience("urn:ovaphlow:crate:audience")
        .setExpirationTime('7d')
        .encode();
    return jwt;
}

export const decodeJwt = (jwt: string) => {
    const payload = jose.UnsecuredJWT.decode(jwt, {
        issuer: "urn:ovaphlow:crate:issuer",
        audience: "urn:ovaphlow:crate:audience"
    });
    return payload;
};

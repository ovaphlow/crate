// @flow
import jose from "jose";

async function jwtMethod() {
    const { publicKey, privateKey } = await jose.generateKeyPair("ES256", {
        kty: "EC",
    });
    console.log(publicKey);
    console.log(privateKey);
    const pubk = await jose.exportSPKI(publicKey);
    console.log("pubk", pubk);
    const prik = await jose.exportPKCS8(privateKey);
    console.log("prik", prik);

    const jwt = await new jose.SignJWT({ id: 1123, upn: "ovaphlow@live.com" })
        .setProtectedHeader({ alg: "ES256" })
        .setIssuedAt()
        .setIssuer("https://ovaphlow.io")
        .setAudience("ovaphlow:crate")
        .setExpirationTime("168h")
        .sign(privateKey);

    console.log(`jwt ${jwt}`);

    const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
        issuer: "https://ovaphlow.io",
        audience: "ovaphlow:crate",
    });

    console.log(protectedHeader);
    console.log(payload);
}

jwtMethod();

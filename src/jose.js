// @flow
const jose = require('jose');

async function jwtMethod() {
  const { publicKey, privateKey } = await jose.generateKeyPair('ES256', { kty: 'EC' });
  // eslint-disable-next-line
  console.log(publicKey);
  // eslint-disable-next-line
  console.log(privateKey);
  const pubk = await jose.exportSPKI(publicKey);
  // eslint-disable-next-line
  console.log('pubk', pubk);
  const prik = await jose.exportPKCS8(privateKey);
  // eslint-disable-next-line
  console.log('prik', prik);

  const jwt = await new jose.SignJWT({ id: 1123, upn: 'ovaphlow@live.com' })
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer('https://ovaphlow.io')
    .setAudience('ovaphlow:crate')
    .setExpirationTime('168h')
    .sign(privateKey);

  // eslint-disable-next-line
  console.log(`jwt ${jwt}`);

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
    issuer: 'https://ovaphlow.io',
    audience: 'ovaphlow:crate',
  });

  // eslint-disable-next-line
  console.log(protectedHeader)
  // eslint-disable-next-line
  console.log(payload)
}

jwtMethod();

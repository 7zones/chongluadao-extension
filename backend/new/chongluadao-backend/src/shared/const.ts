const CLIENTS_APP_STR = process.env.AUTH_CLIENTS_APP_ARRAY;
const CLIENTS_SECRET_STR = process.env.AUTH_CLIENTS_SECRET_ARRAY;
const CLIENTS_ROLE_STR = process.env.AUTH_CLIENTS_ROLE_ARRAY;

const clientsAppArr = CLIENTS_APP_STR.split(',');
const clientsSecretArr = CLIENTS_SECRET_STR.split(',');
const clientsRoleArr = CLIENTS_ROLE_STR.split(',');

export const getClients = () => {
  return clientsAppArr.reduce((acc, curr, idx) => {
    acc.push({
      app: curr,
      secret: clientsSecretArr[idx],
      role: clientsRoleArr[idx],
    });
    return acc;
  }, []);
};

export const RESOURCE_SAFE_CHECK = {
  PHISH_TANK:
    'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt',

  HELLSH: 'https://hell.sh/hosts/domains.txt',

  OISD: 'https://dbl.oisd.nl/',

  ENERGIZED: 'https://block.energized.pro/basic/formats/one-line.txt',

  MATRIX_PHISHING:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/phishing/domains.list',
  MATRIX_ADWARE:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/adware/domains.list',
  MATRIX_SPYWARE:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/spyware/domains.list',
  MATRIX_SCAMMING:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/scamming/domains.list',
  MATRIX_PORN:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/porno-sites/domains.list',
  MATRIX_MALICIOUS:
    'https://raw.githubusercontent.com/mypdns/matrix/master/source/malicious/domains.list',

  SEGASEC_DOMAIN:
    'https://raw.githubusercontent.com/Segasec/feed/master/phishing-domains.json',
};

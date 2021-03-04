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

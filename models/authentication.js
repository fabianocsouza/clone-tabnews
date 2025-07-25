import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findOneByUserEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    throw error;
  }

  async function findOneByUserEmail(providedEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByUserEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não conferem.",
          action: "Verifique se este dado está correto.",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não conferem.",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;

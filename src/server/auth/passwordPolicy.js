const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validatePasswordPolicy(password) {
  return PASSWORD_POLICY_REGEX.test(password);
}

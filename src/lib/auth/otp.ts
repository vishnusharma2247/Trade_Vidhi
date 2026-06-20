export type AuthMethod = "email" | "phone";
export type AuthMode = "signin" | "signup";

export type SupplementalSignUpField =
  | "firstName"
  | "lastName"
  | "username"
  | "password"
  | "emailAddress"
  | "phoneNumber"
  | "legalAccepted";

const supplementalFieldAliases: Record<string, SupplementalSignUpField> = {
  firstName: "firstName",
  first_name: "firstName",
  lastName: "lastName",
  last_name: "lastName",
  username: "username",
  password: "password",
  emailAddress: "emailAddress",
  email_address: "emailAddress",
  phoneNumber: "phoneNumber",
  phone_number: "phoneNumber",
  legalAccepted: "legalAccepted",
  legal_accepted: "legalAccepted",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIndianPhone(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (value.startsWith("00") && digitsOnly.length > 2) {
    return `+${digitsOnly.slice(2)}`;
  }

  if (value.startsWith("+")) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `+91${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }

  return digitsOnly;
}

export function normalizeContact(method: AuthMethod, value: string) {
  const trimmed = value.trim();

  if (method === "email") {
    return trimmed.toLowerCase();
  }

  return normalizeIndianPhone(trimmed);
}

export function validateContact(method: AuthMethod, value: string) {
  const normalized = normalizeContact(method, value);

  if (!normalized) {
    return {
      normalized,
      error:
        method === "email"
          ? "Enter your email address to receive an OTP."
          : "Enter your phone number with country code to receive an OTP.",
    };
  }

  if (method === "email" && !emailPattern.test(normalized)) {
    return {
      normalized,
      error: "Enter a valid email address.",
    };
  }

  return { normalized, error: null };
}

export function getContactPlaceholder(method: AuthMethod) {
  return method === "email"
    ? "Enter your email"
    : "Enter your phone number";
}

export function getContactKeyboardType(method: AuthMethod) {
  return method === "email" ? "email-address" : "phone-pad";
}

export function getVerifiedIdentifierField(method: AuthMethod) {
  return method === "email" ? "emailAddress" : "phoneNumber";
}

export function isSupportedSupplementalField(
  field: string,
): field is SupplementalSignUpField {
  return field in supplementalFieldAliases;
}

export function normalizeSupplementalField(field: string) {
  return supplementalFieldAliases[field];
}

export function getSupplementalSignUpFields(
  missingFields: string[],
  verifiedMethod: AuthMethod,
) {
  const verifiedField = getVerifiedIdentifierField(verifiedMethod);

  return missingFields.filter(
    (field): field is SupplementalSignUpField =>
      normalizeSupplementalField(field) !== verifiedField &&
      isSupportedSupplementalField(field),
  ).map((field) => normalizeSupplementalField(field));
}

export function matchesVerifiedIdentifierField(
  field: string,
  verifiedField: "emailAddress" | "phoneNumber",
) {
  const normalizedField = normalizeSupplementalField(field);
  return normalizedField === verifiedField;
}

export function dedupeSupplementalFields(fields: SupplementalSignUpField[]) {
  return fields.filter((field, index) => fields.indexOf(field) === index);
}

export function normalizeUnsupportedFields(fields: string[]) {
  return fields.map((field) => normalizeSupplementalField(field) ?? field);
}

export function getUnverifiedIdentifierMethod(field: string) {
  const normalizedField = normalizeSupplementalField(field);

  if (normalizedField === "emailAddress") {
    return "email" as const;
  }

  if (normalizedField === "phoneNumber") {
    return "phone" as const;
  }

  return null;
}

export function getIdentifierUnverifiedKey(method: AuthMethod) {
  return method === "email" ? "email_address" : "phone_number";
}

export function getIdentifierStateField(method: AuthMethod) {
  return method === "email" ? "emailAddress" : "phoneNumber";
}

export function getIdentifierValue(
  values: { emailAddress: string; phoneNumber: string },
  method: AuthMethod,
) {
  return method === "email" ? values.emailAddress : values.phoneNumber;
}

export function getIdentifierLabel(method: AuthMethod) {
  return method === "email" ? "Email Address" : "Phone Number";
}

export function getIdentifierPlaceholder(method: AuthMethod) {
  return method === "email" ? "Email Address" : "Phone Number";
}

export function getIdentifierKeyboardType(method: AuthMethod) {
  return method === "email" ? "email-address" : "phone-pad";
}

export function getSupplementalFieldSet(missingFields: string[], verifiedMethod: AuthMethod) {
  return dedupeSupplementalFields(
    getSupplementalSignUpFields(missingFields, verifiedMethod),
  );
}

export function formatFieldLabel(field: string) {
  switch (field) {
    case "firstName":
      return "First Name";
    case "lastName":
      return "Last Name";
    case "username":
      return "Username";
    case "password":
      return "Password";
    case "legalAccepted":
      return "Terms Acceptance";
    case "emailAddress":
      return "Email Address";
    case "phoneNumber":
      return "Phone Number";
    default:
      return field;
  }
}

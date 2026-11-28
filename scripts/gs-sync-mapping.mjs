const BRANCHES = Object.freeze({
  "vadodara": {
    id: "VAD",
    genders: ["male", "female"]
  },
  "ahmedabad": {
    id: "AHM",
    genders: ["male", "female"]
  },
  "surat": {
    id: "SUR",
    genders: ["female"]
  },
  "vallabh vidyanagar": {
    id: "VVN",
    genders: ["male", "female"]
  },
  "pune": {
    id: "PUN",
    genders: ["male", "female"]
  },
  "bhavnagar": {
    id: "BHV",
    genders: ["male"]
  },
  "sandhurst road, mumbai": {
    id: "SRM",
    genders: ["male"]
  },
  "andheri, mumbai": {
    id: "ANM",
    genders: ["male"]
  }
});

const ALLOWED_STATUSES = new Set([
  "completed",
  "incomplete",
  "pending_verification"
]);

function optionalText(value) {
  return typeof value === "string"
    ? value
    : null;
}

export function mapRegistration(doc) {
  if (!doc?._id) {
    return null;
  }

  const branch =
    typeof doc.branch === "string"
      ? doc.branch.trim().toLowerCase()
      : "";

  const gender =
    typeof doc.gender === "string"
      ? doc.gender.trim().toLowerCase()
      : "";

  const status = doc.registrationStatus;

  // Reject unknown branches
  if (!Object.hasOwn(BRANCHES, branch)) {
    return null;
  }

  const branchConfig = BRANCHES[branch];

  // Reject invalid hostel/gender combinations
  if (!branchConfig.genders.includes(gender)) {
    return null;
  }

  // Reject unknown registration statuses
  if (!ALLOWED_STATUSES.has(status)) {
    return null;
  }

  return {
    mongo_id: doc._id.toString(),

    firstName: optionalText(doc.firstName),
    middleName: optionalText(doc.middleName),
    surname: optionalText(doc.surname),
    grnumber: optionalText(doc.grnumber),

    registrationStatus: status,

    branch,
    branch_id: branchConfig.id,
    gender,

    role: optionalText(doc.role),

    alsoParticipatesInCultural:
      typeof doc.alsoParticipatesInCultural === "boolean"
        ? String(doc.alsoParticipatesInCultural)
        : null,

    outdoorSports: optionalText(doc.outdoorSports),
    indoorSports: optionalText(doc.indoorSports),

    jerseyNumber:
      Number.isInteger(doc.jerseyNumber) &&
      doc.jerseyNumber >= -2147483648 &&
      doc.jerseyNumber <= 2147483647
        ? doc.jerseyNumber
        : null,

    tshirt: optionalText(doc.tshirt),
    waist: optionalText(doc.waist),

    source_updated_at:
      doc.updatedAt instanceof Date &&
      !Number.isNaN(doc.updatedAt.getTime())
        ? doc.updatedAt.toISOString()
        : null
  };
}
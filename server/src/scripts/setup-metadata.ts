import "dotenv/config";
import cloudinary from "../services/cloudinary.js";

interface DatasourceEntry {
  external_id: string;
  value: string;
}

interface MetadataFieldDef {
  external_id: string;
  label: string;
  type: "string" | "enum" | "set";
  mandatory?: boolean;
  datasource?: { values: DatasourceEntry[] };
}

function enumValues(values: string[]): { values: DatasourceEntry[] } {
  return {
    values: values.map((v) => ({
      external_id: v.toLowerCase().replace(/\s+/g, "_"),
      value: v,
    })),
  };
}

const fields: MetadataFieldDef[] = [
  {
    external_id: "pawprint_pet_id",
    label: "Pet ID",
    type: "string",
    mandatory: false,
  },
  {
    external_id: "pawprint_pet_name",
    label: "Pet Name",
    type: "string",
  },
  {
    external_id: "pawprint_species",
    label: "Species",
    type: "enum",
    datasource: enumValues(["Dog", "Cat", "Rabbit", "Bird", "Other"]),
  },
  {
    external_id: "pawprint_breed",
    label: "Breed",
    type: "string",
  },
  {
    external_id: "pawprint_age",
    label: "Age",
    type: "string",
  },
  {
    external_id: "pawprint_sex",
    label: "Sex",
    type: "enum",
    datasource: enumValues(["Male", "Female", "Unknown"]),
  },
  {
    external_id: "pawprint_temperament",
    label: "Temperament",
    type: "set",
    datasource: enumValues([
      "Friendly",
      "Shy",
      "Playful",
      "Calm",
      "Energetic",
      "Gentle",
      "Independent",
      "Affectionate",
    ]),
  },
  {
    external_id: "pawprint_shelter_name",
    label: "Shelter Name",
    type: "string",
  },
  {
    external_id: "pawprint_shelter_contact",
    label: "Shelter Contact",
    type: "string",
  },
  {
    external_id: "pawprint_shelter_location",
    label: "Shelter Location",
    type: "string",
  },
  {
    external_id: "pawprint_status",
    label: "Status",
    type: "enum",
    datasource: enumValues(["Available", "Pending", "Adopted"]),
  },
  {
    external_id: "pawprint_caption",
    label: "Caption",
    type: "string",
  },
];

async function main() {
  console.log("Setting up PawPrint metadata fields...\n");

  for (const field of fields) {
    try {
      await cloudinary.api.add_metadata_field(field);
      console.log(`  Created: ${field.external_id} (${field.type})`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : JSON.stringify(err);
      if (message.includes("already exists")) {
        console.log(`  Exists:  ${field.external_id} (skipped)`);
      } else {
        console.error(`  FAILED:  ${field.external_id} — ${message}`);
      }
    }
  }

  console.log("\nMetadata setup complete.");
}

main();

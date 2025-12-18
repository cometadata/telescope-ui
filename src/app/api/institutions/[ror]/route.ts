import { NextRequest, NextResponse } from "next/server";
import { getInstitutionByRor } from "@/lib/typesense";
import {
  badRequest,
  notFound,
  isValidRorHash,
  handleAPIError,
} from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ror: string }> }
) {
  const { ror } = await params;

  if (!ror) {
    return badRequest("ROR ID required");
  }

  if (!isValidRorHash(ror)) {
    return badRequest("Invalid ROR ID format");
  }

  try {
    const institution = await getInstitutionByRor(ror);

    if (!institution) {
      return notFound("Institution not found");
    }

    return NextResponse.json(institution);
  } catch (error) {
    return handleAPIError(error, "Institution lookup");
  }
}

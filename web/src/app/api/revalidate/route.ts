import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity calls this webhook on publish/unpublish/delete so edits go live
// immediately instead of waiting out the 60s ISR window. Configure the GROQ
// webhook at sanity.io/manage with the same secret as SANITY_REVALIDATE_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse("Missing SANITY_REVALIDATE_SECRET", { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
  if (!isValidSignature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  // { expire: 0 } expires the tag immediately so a publish is visible on the
  // very next request, rather than stale-while-revalidate's one-visit lag.
  revalidateTag("sanity", { expire: 0 });
  return NextResponse.json({ revalidated: true, type: body?._type ?? null });
}

export async function GET() {
  try {
    await fetch("https://https://kdwpltqjpnjrgdzfgqgo.supabase.co/rest/v1/");

    return Response.json({
      message: "Supabase active"
    });
  } catch (error) {
    return Response.json(
      { error: "Ping failed" },
      { status: 500 }
    );
  }
}

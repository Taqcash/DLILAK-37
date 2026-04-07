import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        full_name: `${user.firstName} ${user.lastName}`,
        avatar_url: user.imageUrl,
        role: 'user',
        points: 0,
        is_verified: false
      })
      .select()
      .single();

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    return NextResponse.json(newProfile);
  }

  return NextResponse.json(profile);
}

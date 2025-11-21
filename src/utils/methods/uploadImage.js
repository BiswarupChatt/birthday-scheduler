import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON
);

export async function uploadImage(fileBlob, fileName) {
    try {
        const { data, error } = await supabase.storage
            .from("birthday-app")
            .upload(fileName, fileBlob, {
                contentType: "image/png",
                // upsert: true,         // <--- ALLOWS overwrite
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from("birthday-app")
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (err) {
        throw err;
    }
}


export async function deleteUploadedFile(fileName) {
    const { error } = await supabase.storage
        .from("birthday-app")
        .remove([fileName]);

    if (error) throw error;
}

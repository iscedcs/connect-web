"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema, type EditProfileInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, IdCard, MapPin } from "lucide-react";
import Link from "next/link";
import { AttachmentIcon, LocationIcon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImagePicker from "@/components/shared/image-picker";

export default function EditProfileForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<EditProfileInput>;
  onSubmit?: (data: EditProfileInput) => void;
}) {
  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "Ignatius Emeka",
      bio: "Software engineer",
      address: "AMG workspace 22 road, First Floor, Festac Town.",
      profileImage: null,
      coverImage: null,
      ...defaultValues,
    },
  });

  const submit = form.handleSubmit((data) => {
    // You can wire API here later
    onSubmit?.(data);
    // console.log(data);
  });

  return (
    <div className="mx-auto w-full max-w-screen-sm px-4 py-4">
      <div className="mb-3">
        <Link href="/" className="inline-flex items-center gap-2 text-white/90">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6">
        Edit your contactless profile.
      </h1>

      <Form {...form}>
        <form onSubmit={submit} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <AttachmentIcon />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Full name"
                      className="w-full bg-transparent border-none outline-none shadow-none rounded-none text-base placeholder-white/60"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <p className="text-xs text-white/60 ">Bio</p>
                <FormControl>
                  <div className="border-b border-white/10">
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={2}
                      placeholder="A short description"
                      className="w-full pl-0 bg-transparent border-none outline-none shadow-none rounded-none text-base placeholder-white/60"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-start gap-2  border-b border-white/10">
                    <LocationIcon />
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Your address"
                      className="w-full bg-transparent border-none outline-none shadow-none rounded-none text-base placeholder-white/60"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <p className="text-sm mb-2">Add a profile photo</p>
            <Controller
              control={form.control}
              name="profileImage"
              render={({ field: { value, onChange } }) => (
                <ImagePicker
                  value={value ?? null}
                  onChange={onChange}
                  variant="profile"
                />
              )}
            />
          </div>

          <div>
            <p className="text-sm mb-2">Add a cover photo</p>
            <Controller
              control={form.control}
              name="coverImage"
              render={({ field: { value, onChange } }) => (
                <ImagePicker
                  value={value ?? null}
                  onChange={onChange}
                  variant="cover"
                  placeholder={
                    <p className="text-sm text-white/80 leading-snug px-4">
                      Take a picture and leave it here
                      <br />
                      or click to select a photo.
                    </p>
                  }
                />
              )}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full rounded-xl"
            disabled={!form.formState.isValid || form.formState.isSubmitting}>
            Next
          </Button>
        </form>
      </Form>
    </div>
  );
}

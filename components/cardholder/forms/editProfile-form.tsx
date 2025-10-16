"use client";

import ImagePicker from "@/components/shared/image-picker";
import GoogleAddressField from "@/components/shared/location-auto-complete";
import LocationAutocomplete from "@/components/shared/location-auto-complete";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentIcon, LocationIcon } from "@/lib/icons";
import { editProfileSchema, type EditProfileInput } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  defaultValues?: Partial<EditProfileInput>;
  onSubmit?: (data: EditProfileInput) => void | Promise<void>;
};

const BIO_MAX = 160;

export default function EditProfileForm({ defaultValues, onSubmit }: Props) {
  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      position: " ",
      bio: " ",
      address: " ",

      profileImage: null,
      coverImage: null,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name ?? "",
        position: defaultValues.position ?? "",
        bio: defaultValues.bio ?? "",
        address: defaultValues.address ?? "",
        profileImage: defaultValues.profileImage ?? null,
        coverImage: defaultValues.coverImage ?? null,
      });
    }
  }, [
    defaultValues?.name,
    defaultValues?.position,
    defaultValues?.bio,
    defaultValues?.address,
    defaultValues?.profileImage,
    defaultValues?.coverImage,
  ]);

  const bioCount = form.watch("bio")?.length ?? 0;

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  const submit = form.handleSubmit((data) => {
    onSubmit?.(data);
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
            name="name"
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
                      aria-invalid={!!form.formState.errors.name}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <p className="text-xs text-white/60 ">Position</p>
                <FormControl>
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your position"
                      className="w-full bg-transparent border-none outline-none shadow-none rounded-none text-base placeholder-white/60"
                      aria-invalid={!!form.formState.errors.position}
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
                      maxLength={BIO_MAX}
                      placeholder="A short description"
                      className="w-full pl-0 bg-transparent border-none outline-none shadow-none rounded-none text-base placeholder-white/60"
                      aria-invalid={!!form.formState.errors.bio}
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
                  <GoogleAddressField
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val)}
                    onSelectAddress={(structured) => {
                      console.log("Structured:", structured);

                      form.setValue("structuredAddress", structured);
                    }}
                  />
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
            disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Saving..." : "Next"}{" "}
          </Button>
        </form>
      </Form>
    </div>
  );
}

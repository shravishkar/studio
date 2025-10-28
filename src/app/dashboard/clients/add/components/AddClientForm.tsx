'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { addClient } from '@/lib/api';
import type { NewClient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberInput } from '@/components/ui/phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Validation schema using Zod, now with profileImageBinary and updated phone validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().refine(val => !val || isValidPhoneNumber(val), {
    message: "Invalid phone number."
  }).optional(),
  profileImageBinary: z.string().min(1, { message: "Profile image is required." }),
});

export default function AddClientForm() {
  const router = useRouter();
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<NewClient>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      profileImageBinary: '',
    },
  });

  const { formState: { isDirty } } = form;

  const handleBackClick = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('profileImageBinary', base64String, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
        form.setValue('profileImageBinary', '', { shouldValidate: true });
        setImagePreview(null);
    }
  };

  const onSubmit: SubmitHandler<NewClient> = async (data) => {
    if (!tenantId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing. Please log in again.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await addClient(tenantId, token, data);
      toast({ title: "Success", description: response.message });
      form.reset();
      router.push('/dashboard/clients'); // Optional: redirect on success
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Profile Preview" width={96} height={96} className="object-cover" />
                    ) : (
                        <span className="text-xs text-gray-500">Image Preview</span>
                    )}
                    </div>
                    <div>
                      <Input type="file" onChange={handleFileChange} accept="image/*" />
                      {form.formState.errors.profileImageBinary && <p className="text-red-500 text-xs mt-1">{form.formState.errors.profileImageBinary.message}</p>}
                    </div>
                </div>

              <div>
                <Input placeholder="Name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Input placeholder="Email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
              </div>

              <div>
                <PhoneNumberInput name="phone" />
                {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Client...' : 'Add Client'}
                </Button>
                <Button type="button" variant="outline" onClick={handleBackClick}>
                  Back
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

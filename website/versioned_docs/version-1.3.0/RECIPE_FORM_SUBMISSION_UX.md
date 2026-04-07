---
title: Recipe - Form Submission UX with Toast Feedback
slug: /recipes/form-submission-ux-toasts
---


# Recipe - Form Submission UX with Toast Feedback

## Problem statement

Forms often fail silently or show inconsistent feedback between validation, submitting state, and final result.

## Solution approach

Validate inputs first, then run submit with `toast.promise(...)` so users get a single clear flow.

## Copy-paste code example

```tsx
import React, { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { toast } from "react-native-toast-system";

async function submitProfile(input: { email: string }) {
  const res = await fetch("https://example.com/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Could not save profile");
}

export function ProfileForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.includes("@")) {
      toast.warning("Enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      await toast.promise(
        submitProfile({ email }),
        {
          loading: { title: "Saving profile..." },
          success: { title: "Profile saved", variant: "success" },
          error: (error) => ({ title: "Save failed", description: String(error) }),
        },
        {
          groupId: "profile:submit",
          groupBehavior: "update-in-group",
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
      <Button title={submitting ? "Saving..." : "Save"} onPress={onSubmit} disabled={submitting} />
    </View>
  );
}
```

## Expected behavior

- Invalid input shows immediate validation feedback.
- Submit action shows loading then success/error in one flow.
- Rapid taps do not create duplicate progress toasts for the same form operation.

## Common pitfall

- Pitfall: forgetting to disable submit while request is in-flight.
- Fix: track `submitting` state and disable the button to prevent accidental duplicate requests.

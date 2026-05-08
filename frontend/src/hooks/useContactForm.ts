import { useCallback, useState } from "react";
import { submitContactInquiry } from "../services/contactService";
import type { ContactFormValues, SubmissionState } from "../types/contact";

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

export function useContactForm(source: string) {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [state, setState] = useState<SubmissionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const submit = useCallback(async () => {
    setState("submitting");
    setError(null);

    try {
      await submitContactInquiry({ ...values, source });
      setValues(initialValues);
      setState("success");
    } catch (submitError) {
      setState("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your inquiry right now.",
      );
    }
  }, [source, values]);

  const resetStatus = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    values,
    state,
    error,
    updateField,
    submit,
    resetStatus,
  };
}

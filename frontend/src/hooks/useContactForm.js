import { useCallback, useState } from "react";
import { submitContactInquiry } from "../services/contactService";
const initialValues = {
    name: "",
    email: "",
    message: "",
};
export function useContactForm(source) {
    const [values, setValues] = useState(initialValues);
    const [state, setState] = useState("idle");
    const [error, setError] = useState(null);
    const updateField = useCallback((field, value) => {
        setValues((current) => ({ ...current, [field]: value }));
    }, []);
    const submit = useCallback(async () => {
        setState("submitting");
        setError(null);
        try {
            await submitContactInquiry({ ...values, source });
            setValues(initialValues);
            setState("success");
            return {
                success: true,
                message: "Inquiry received. We will reach out soon.",
            };
        }
        catch (submitError) {
            const message = submitError instanceof Error
                ? submitError.message
                : "Unable to submit your inquiry right now.";
            setState("error");
            setError(message);
            return {
                success: false,
                message,
            };
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

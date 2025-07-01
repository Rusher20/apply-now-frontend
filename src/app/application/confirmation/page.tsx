    import Link from "next/link";

    export default function ApplicationConfirmation() {
    return (
        <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-t from-sky-500 to-indigo-500 p-4 sm:p-8"
        style={{ backgroundAttachment: "fixed" }}
        >
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 animate-fade-in">
            <div className="flex justify-center mb-6">
            <Link href="/">
                <img
                src="/PPSI.png"
                alt="PPSI Logo"
                className="h-20 object-contain"
                />
            </Link>
            </div>

            <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
                Thank you for applying!
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
                Your application has been successfully submitted. We will get in touch with you soon.
            </p>

            <Link
                href="https://www.progresspro.com.ph/careers"
                className="inline-block mt-4 px-6 py-3 rounded-full bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition duration-300"
            >
                Back to Careers
            </Link>
            </div>
        </div>
        </div>
    );
    }

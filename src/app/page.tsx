"use client";

import { useMutation } from "@apollo/client";
import { SUBMIT_APPLICATION } from "@/graphql/mutations/submitApplication";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    contactNumber: "",
    address: "",
    position: "",
    city: "",
    province: "",
    region: "",
    expectedSalary: "",
    applicationLetter: "",
    resume: null as File | null,
  });

  const [submitApplication, { loading }] = useMutation(SUBMIT_APPLICATION);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await submitApplication({
        variables: {
          input: {
            name: formData.name,
            gender: formData.gender,
            email: formData.email,
            contactNumber: formData.contactNumber,
            address: formData.address,
            position: formData.position,
            city: formData.city,
            province: formData.province,
            region: formData.region,
            expectedSalary: formData.expectedSalary,
            applicationLetter: formData.applicationLetter,
          },
          file: formData.resume,
        },
      });

      // ✅ Redirect to confirmation page after successful submit
      router.push("/application/confirmation");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-t from-sky-500 to-indigo-500 p-4 sm:p-8"
      style={{ backgroundAttachment: "fixed" }}
    >
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-6 sm:p-5">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/PPSI.png"
            alt="PPSI Logo"
            className="h-20 object-contain"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-2xl space-y-5"
        >
          <h1 className="text-2xl font-extrabold text-blue-600 text-center">
            Apply Now
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="contactNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="position"
              placeholder="Desired Position"
              value={formData.position}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="city"
              placeholder="Current City"
              value={formData.city}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="province"
              placeholder="Current Province"
              value={formData.province}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="region"
              placeholder="Current Region"
              value={formData.region}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <input
              name="expectedSalary"
              placeholder="Expected Monthly Salary"
              value={formData.expectedSalary}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <input
            name="address"
            placeholder="Complete Home Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />

          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
                required
                className="accent-blue-500"
              />
              Male
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
                className="accent-blue-500"
              />
              Female
            </label>
          </div>

          <textarea
            name="applicationLetter"
            placeholder="Application Letter / Cover Letter"
            value={formData.applicationLetter}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Upload Resume
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 transition"
            />
            {formData.resume && (
              <p className="text-sm mt-1 text-gray-700">
                Attached: {formData.resume.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-md font-bold transition"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

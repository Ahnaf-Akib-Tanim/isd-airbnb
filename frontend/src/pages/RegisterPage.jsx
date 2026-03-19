import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { readFileAsDataUrl, readFilesAsDataUrls } from "../utils/fileUtils";

const hostHintStyle = {
  marginTop: "0.35rem",
  color: "var(--airbnb-gray)",
  fontSize: "0.8rem",
};

const RegisterPage = () => {
  const { register: registerUser, loading, error, setError } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "GUEST",
      propertyTypesOfferedInput: "",
      offeringHighlightsInput: "",
      responseTimeHours: 4,
    },
  });
  const navigate = useNavigate();
  const selectedRole = watch("role");
  const [profilePreview, setProfilePreview] = useState("");
  const [hostImageNames, setHostImageNames] = useState([]);

  const onSubmit = async (data) => {
    const profileImageFile = data.profileImage?.[0];
    const hostPortfolioFiles = data.hostPortfolioFiles || [];
    const profileImage = profileImageFile
      ? await readFileAsDataUrl(profileImageFile)
      : "";

    const payload = {
      ...data,
      profileImage,
      propertyTypesOffered: (data.propertyTypesOfferedInput || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      offeringHighlights: (data.offeringHighlightsInput || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      hostPortfolioImages: await readFilesAsDataUrls(hostPortfolioFiles),
    };

    delete payload.confirmPassword;
    delete payload.propertyTypesOfferedInput;
    delete payload.offeringHighlightsInput;
    delete payload.profileImage;
    delete payload.hostPortfolioFiles;

    payload.profileImage = profileImage;

    const result = await registerUser(payload);
    if (result.success) {
      navigate("/profile");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilePreview("");
      return;
    }
    setProfilePreview(await readFileAsDataUrl(file));
  };

  const handleHostPortfolioChange = (event) => {
    setHostImageNames(
      Array.from(event.target.files || []).map((file) => file.name),
    );
  };

  return (
    <div className="page-wrapper">
      <section className="page-content">
        <div
          className="container-sm animate-fade-in-up"
          style={{ paddingTop: "96px", paddingBottom: "64px" }}
        >
          <div className="card">
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
              Join ISD Airbnb
            </h1>
            <p style={{ marginBottom: "1.75rem" }}>
              Create an account to book unique stays or start hosting guests.
            </p>

            {error && (
              <div
                className="alert alert-error"
                style={{ marginBottom: "1.5rem" }}
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    color: "inherit",
                    fontSize: "0.8rem",
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="auth-form"
              noValidate
            >
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <span className="form-label">Account type</span>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {["GUEST", "HOST"].map((role) => (
                    <label
                      key={role}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        border:
                          selectedRole === role
                            ? "2px solid var(--airbnb-dark)"
                            : "1.5px solid var(--airbnb-light-gray)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      <input
                        type="radio"
                        value={role}
                        {...register("role")}
                        style={{ display: "none" }}
                      />
                      <strong>{role === "GUEST" ? "Guest" : "Host"}</strong>
                      <p style={hostHintStyle}>
                        {role === "GUEST"
                          ? "Book unique homes around the world."
                          : "Create a real host profile with stay details and hosting preferences."}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="profileImage">
                  Profile image{" "}
                  {selectedRole === "HOST"
                    ? "(required for hosts)"
                    : "(optional)"}
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="form-input"
                  {...register("profileImage", {
                    validate: (value) =>
                      selectedRole !== "HOST" ||
                      value?.length > 0 ||
                      "Hosts must upload a profile image",
                  })}
                  onChange={handleProfileImageChange}
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginTop: "0.75rem",
                    }}
                  />
                )}
                {errors.profileImage && (
                  <p className="form-error">{errors.profileImage.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={`form-input ${errors.firstName ? "error" : ""}`}
                  placeholder="John"
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={`form-input ${errors.lastName ? "error" : ""}`}
                  placeholder="Doe"
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: { value: 2, message: "At least 2 characters" },
                  })}
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="phoneNumber">
                  Phone number{" "}
                  {selectedRole === "HOST"
                    ? "(required for hosts)"
                    : "(optional)"}
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={`form-input ${errors.phoneNumber ? "error" : ""}`}
                  placeholder="+8801XXXXXXXXX"
                  {...register("phoneNumber", {
                    validate: (value) =>
                      selectedRole !== "HOST" ||
                      value?.trim() ||
                      "Phone number is required for hosts",
                  })}
                />
                {errors.phoneNumber && (
                  <p className="form-error">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Create a password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Repeat your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="bio">
                  About you
                </label>
                <textarea
                  id="bio"
                  className="form-input"
                  style={{ minHeight: "92px", resize: "vertical" }}
                  placeholder="Tell guests or hosts a little about yourself."
                  {...register("bio")}
                />
              </div>

              {selectedRole === "HOST" && (
                <>
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "16px",
                      background: "var(--airbnb-bg)",
                      marginBottom: "1rem",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <h2
                      style={{ fontSize: "1.05rem", marginBottom: "0.35rem" }}
                    >
                      Host onboarding
                    </h2>
                    <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                      These details make the host profile realistic now and
                      reusable for listings and availability later.
                    </p>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label className="form-label" htmlFor="hostDisplayName">
                        Host display name
                      </label>
                      <input
                        id="hostDisplayName"
                        type="text"
                        className={`form-input ${errors.hostDisplayName ? "error" : ""}`}
                        placeholder="Ahnaf's stays"
                        {...register("hostDisplayName", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.trim() ||
                            "Host display name is required",
                        })}
                      />
                      {errors.hostDisplayName && (
                        <p className="form-error">
                          {errors.hostDisplayName.message}
                        </p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label className="form-label" htmlFor="hostAbout">
                        Host introduction
                      </label>
                      <textarea
                        id="hostAbout"
                        className={`form-input ${errors.hostAbout ? "error" : ""}`}
                        style={{ minHeight: "96px", resize: "vertical" }}
                        placeholder="Describe your hosting style, what guests can expect, and what kind of spaces you manage."
                        {...register("hostAbout", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.trim() ||
                            "Host introduction is required",
                        })}
                      />
                      {errors.hostAbout && (
                        <p className="form-error">{errors.hostAbout.message}</p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label className="form-label" htmlFor="hostingSince">
                        Hosting since
                      </label>
                      <input
                        id="hostingSince"
                        type="date"
                        className={`form-input ${errors.hostingSince ? "error" : ""}`}
                        {...register("hostingSince", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value ||
                            "Hosting start date is required",
                        })}
                      />
                      {errors.hostingSince && (
                        <p className="form-error">
                          {errors.hostingSince.message}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div
                        className="form-group"
                        style={{ marginBottom: "1rem" }}
                      >
                        <label
                          className="form-label"
                          htmlFor="preferredCheckInTime"
                        >
                          Preferred check-in time
                        </label>
                        <input
                          id="preferredCheckInTime"
                          type="time"
                          className={`form-input ${errors.preferredCheckInTime ? "error" : ""}`}
                          {...register("preferredCheckInTime", {
                            validate: (value) =>
                              selectedRole !== "HOST" ||
                              value ||
                              "Check-in time is required",
                          })}
                        />
                        {errors.preferredCheckInTime && (
                          <p className="form-error">
                            {errors.preferredCheckInTime.message}
                          </p>
                        )}
                      </div>

                      <div
                        className="form-group"
                        style={{ marginBottom: "1rem" }}
                      >
                        <label
                          className="form-label"
                          htmlFor="preferredCheckOutTime"
                        >
                          Preferred check-out time
                        </label>
                        <input
                          id="preferredCheckOutTime"
                          type="time"
                          className={`form-input ${errors.preferredCheckOutTime ? "error" : ""}`}
                          {...register("preferredCheckOutTime", {
                            validate: (value) =>
                              selectedRole !== "HOST" ||
                              value ||
                              "Check-out time is required",
                          })}
                        />
                        {errors.preferredCheckOutTime && (
                          <p className="form-error">
                            {errors.preferredCheckOutTime.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label className="form-label" htmlFor="responseTimeHours">
                        Expected response time (hours)
                      </label>
                      <input
                        id="responseTimeHours"
                        type="number"
                        min="1"
                        max="72"
                        className="form-input"
                        {...register("responseTimeHours", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        className="form-label"
                        htmlFor="propertyTypesOfferedInput"
                      >
                        Property types offered
                      </label>
                      <input
                        id="propertyTypesOfferedInput"
                        type="text"
                        className={`form-input ${errors.propertyTypesOfferedInput ? "error" : ""}`}
                        placeholder="Apartment, Villa, Studio"
                        {...register("propertyTypesOfferedInput", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.split(",").some((item) => item.trim()) ||
                            "At least one property type is required",
                        })}
                      />
                      <p style={hostHintStyle}>Separate values with commas.</p>
                      {errors.propertyTypesOfferedInput && (
                        <p className="form-error">
                          {errors.propertyTypesOfferedInput.message}
                        </p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        className="form-label"
                        htmlFor="offeringHighlightsInput"
                      >
                        Offering highlights
                      </label>
                      <input
                        id="offeringHighlightsInput"
                        type="text"
                        className={`form-input ${errors.offeringHighlightsInput ? "error" : ""}`}
                        placeholder="Airport pickup, Self check-in, Breakfast, Workspace"
                        {...register("offeringHighlightsInput", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.split(",").some((item) => item.trim()) ||
                            "At least one host offering is required",
                        })}
                      />
                      <p style={hostHintStyle}>Separate values with commas.</p>
                      {errors.offeringHighlightsInput && (
                        <p className="form-error">
                          {errors.offeringHighlightsInput.message}
                        </p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label className="form-label" htmlFor="houseRules">
                        House rules
                      </label>
                      <textarea
                        id="houseRules"
                        className={`form-input ${errors.houseRules ? "error" : ""}`}
                        style={{ minHeight: "96px", resize: "vertical" }}
                        placeholder="No smoking, quiet hours after 10 PM, valid ID at check-in..."
                        {...register("houseRules", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.trim() ||
                            "House rules are required",
                        })}
                      />
                      {errors.houseRules && (
                        <p className="form-error">
                          {errors.houseRules.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="hostPortfolioFiles"
                      >
                        Host or room images
                      </label>
                      <input
                        id="hostPortfolioFiles"
                        type="file"
                        multiple
                        accept="image/*"
                        className={`form-input ${errors.hostPortfolioFiles ? "error" : ""}`}
                        {...register("hostPortfolioFiles", {
                          validate: (value) =>
                            selectedRole !== "HOST" ||
                            value?.length > 0 ||
                            "Upload at least one host or room image",
                        })}
                        onChange={handleHostPortfolioChange}
                      />
                      {hostImageNames.length > 0 && (
                        <p style={hostHintStyle}>
                          {hostImageNames.length} file(s) selected
                        </p>
                      )}
                      {errors.hostPortfolioFiles && (
                        <p className="form-error">
                          {errors.hostPortfolioFiles.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Agree and continue"}
              </button>
            </form>

            <p style={{ fontSize: "0.9rem", marginTop: "1.5rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: 600 }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;

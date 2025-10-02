"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import VerificationEmail from "./components/verificationEmail";

const resendApiKey = process.env.RESEND_API_KEY!;
const resend = new Resend(resendApiKey);

export async function sendCode(
  name: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!email || !name) {
      return {
        success: false,
        message: "name or email is missing",
      };
    }

    const currentEmails = await prisma.user.findMany({
      where: {
        email: email,
      },
    });

    if (currentEmails && currentEmails.length > 0) {
      return {
        success: false,
        message: `an account is already associated with the email ${email}`,
      };
    }

    // generate a 6-digit verification code (allows leading zeros)
    const verificationCode = crypto
      .randomInt(0, 1000000)
      .toString()
      .padStart(6, "0");

    const insertVerificationCode = await prisma.verificationCode.create({
      data: {
        name: name,
        email: email,
        verificationCode: verificationCode,
      },
    });

    if (!insertVerificationCode || !insertVerificationCode.id) {
      console.error(
        "verification code create returned unexpected result:",
        insertVerificationCode
      );
      return {
        success: false,
        message: "failed to create verification code",
      };
    }

    const { error } = await resend.emails.send({
      from: "filegilla <no-reply@info.filegilla.com>",
      to: email,
      subject: "filegilla email verification code",
      react: VerificationEmail({ name, verificationCode }),
    });

    if (error) {
      console.log("resend error: ", error);
      return {
        success: false,
        message: `error sending verification email: ${error}`,
      };
    }

    // remove expired codes from db
    await cleanUpCodes();

    return {
      success: true,
      message: `successfully sent code to ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `unknown error sending code: ${error}`,
    };
  }
}

async function cleanUpCodes() {
  try {
    const result = await prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count && result.count > 0) {
      console.log(
        `cleanUpCodes: removed ${result.count} expired verification code(s)`
      );
    }
  } catch (error) {
    console.error("cleanUpCodes error:", error);
  }
}

export async function verifyCode(
  codeToVerify: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const dbCode = await prisma.verificationCode.findFirst({
      where: {
        email: email,
        verificationCode: codeToVerify,
      },
    });
    console.log(dbCode);

    if (dbCode) {
      return {
        success: true,
        message: "successfully verified code",
      };
    } else {
      return {
        success: false,
        message: "failed to verify code, please try again",
      };
    }
  } catch (error) {
    console.error("server error verifying code: ", error);
    return {
      success: false,
      message: "failed to verify code, please try again",
    };
  }
}

export async function setEmailToVerified(userId: string) {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    });

    console.log(`successfully set user-${userId}'s emailVerified flag to true`);
  } catch (error) {
    console.error(
      `failed to set user-${userId}'s emailVerified flag to true`,
      error
    );
  }
}

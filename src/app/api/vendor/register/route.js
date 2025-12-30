import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Store from "@/models/Store";
import User from "@/models/User";
import Role from "@/models/Role";
import { getNextCounterValue } from "@/models/Counter";
import { sendVendorRegistrationEmail } from "@/utils/email/mailer";
import { extractAuthFromRequest } from "@/utils/auth/serverAuth";

// POST - Create/Update vendor registration steps
export async function POST(request) {
  try {
    await dbConnect();

    const authData = await extractAuthFromRequest(request);
    if (!authData.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { userId } = authData;
    const body = await request.json();
    const { step, data } = body;

    const existingStore = await Store.findOne({ owner_user_id: userId });

    if (existingStore && existingStore.vendor_status === "Approved") {
      return NextResponse.json(
        {
          success: false,
          message: "You already have an approved vendor account",
        },
        { status: 400 }
      );
    }

    // Step 1: Business Details & Store Name
    if (step === 1) {
      if (data.store_name) {
        // Double check uniqueness before saving
        const nameExists = await Store.findOne({
          store_name: {
            $regex: new RegExp(`^${data.store_name.trim()}$`, "i"),
          },
          _id: { $ne: existingStore?._id },
        });
        if (nameExists) {
          return NextResponse.json(
            { success: false, message: "Store name already exists" },
            { status: 400 }
          );
        }
      }

      const businessData = {
        type: data.business.type,
        country_of_incorporation: data.business.country_of_incorporation, // Requirement 1
        // Requirement 4: These will be null/empty for Individual Sellers via frontend logic
        name: data.business.name,
        registration_number: data.business.registration_number,
        registration_date: data.business.registration_date,
        tax_id: data.business.tax_id,
      };

      if (existingStore) {
        existingStore.business = businessData;
        existingStore.store_name = data.store_name;
        existingStore.registration_step = 1;
        existingStore.registration_data = {
          ...existingStore.registration_data,
          step1: data,
        };
        await existingStore.save();
        return NextResponse.json({ success: true, data: existingStore });
      } else {
        const vendorId = `V${String(
          await getNextCounterValue("vendor")
        ).padStart(5, "0")}`;
        const newStore = new Store({
          store_name: data.store_name,
          owner_user_id: userId,
          vendor_id: vendorId,
          vendor_status: "Pending",
          business: businessData,
          registration_step: 1,
          registration_data: { step1: data },
        });
        await newStore.save();
        return NextResponse.json({ success: true, data: newStore });
      }
    }

    // --- Steps 2 to 5 Logic remains consistent with your provided code ---
    if (step === 2) {
      if (!existingStore)
        return NextResponse.json(
          { success: false, message: "Complete step 1 first" },
          { status: 400 }
        );
      existingStore.contacts = data.contacts;
      existingStore.registration_step = 2;
      existingStore.registration_data = {
        ...existingStore.registration_data,
        step2: data,
      };
      await existingStore.save();
      return NextResponse.json({ success: true, data: existingStore });
    }

    if (step === 3) {
      if (!existingStore)
        return NextResponse.json(
          { success: false, message: "Complete previous steps first" },
          { status: 400 }
        );
      existingStore.warehouses = data.warehouses || [];
      existingStore.channels = data.channels || [];
      existingStore.registration_step = 3;
      existingStore.registration_data = {
        ...existingStore.registration_data,
        step3: data,
      };
      await existingStore.save();
      return NextResponse.json({ success: true, data: existingStore });
    }

    if (step === 4) {
      if (!existingStore)
        return NextResponse.json(
          { success: false, message: "Complete previous steps first" },
          { status: 400 }
        );
      existingStore.payout = data.payout;
      existingStore.registration_step = 4;
      existingStore.registration_data = {
        ...existingStore.registration_data,
        step4: data,
      };
      await existingStore.save();
      return NextResponse.json({ success: true, data: existingStore });
    }

    if (step === 5) {
      if (!existingStore)
        return NextResponse.json(
          { success: false, message: "Complete previous steps first" },
          { status: 400 }
        );
      existingStore.registration_step = 6;
      existingStore.vendor_status = "Pending";
      existingStore.registration_data = {
        ...existingStore.registration_data,
        step5: data,
        submitted_at: new Date(),
      };

      const vendorRole = await Role.findOne({ name: "vendor" });
      const user = await User.findById(userId);
      if (vendorRole && user) {
        user.role = vendorRole._id;
        await user.save();
        await sendVendorRegistrationEmail(
          user.email,
          user.name,
          existingStore.vendor_id
        );
      }
      await existingStore.save();

      return NextResponse.json({
        success: true,
        message: "Registration submitted successfully",
        data: existingStore,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid step" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Vendor registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// GET - Get status OR check store name availability
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const checkName = searchParams.get("check_name");

    // Requirement 2: Real-time availability check
    if (checkName) {
      const nameExists = await Store.findOne({
        store_name: { $regex: new RegExp(`^${checkName.trim()}$`, "i") },
      });
      return NextResponse.json({
        success: true,
        available: !nameExists,
        message: nameExists ? "This name is not available" : "Name Available",
      });
    }

    const authData = await extractAuthFromRequest(request);
    if (!authData.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const store = await Store.findOne({
      owner_user_id: authData.userId,
    }).populate("owner_user_id", "name email");
    return NextResponse.json({ success: true, data: store || null });
  } catch (error) {
    console.error("Error fetching vendor data:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

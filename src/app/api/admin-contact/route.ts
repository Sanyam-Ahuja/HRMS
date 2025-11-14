import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminContact from '@/models/AdminContact';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Generate reference ID
    const referenceId = `AC${Date.now()}`;

    // Create admin contact record
    const adminContact = new AdminContact({
      referenceId,
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      status: 'pending',
      timestamp: new Date(),
    });

    await adminContact.save();

    return NextResponse.json({
      success: true,
      message: 'Contact message sent successfully',
      referenceId: referenceId,
    });

  } catch (error: any) {
    console.error('Admin contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Get admin contacts
    const contacts = await AdminContact.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Get total count
    const totalCount = await AdminContact.countDocuments(query);

    return NextResponse.json({
      success: true,
      contacts: contacts.map((contact: any) => ({
        id: contact._id,
        referenceId: contact.referenceId,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        timestamp: contact.timestamp,
        reply: contact.reply,
        repliedBy: contact.repliedBy,
        repliedAt: contact.repliedAt,
      })),
      totalCount,
    });

  } catch (error: any) {
    console.error('Get admin contacts error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { contactId, status, reply, repliedBy } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Update contact
    const updateData: any = {};
    if (status) updateData.status = status;
    if (reply) {
      updateData.reply = reply;
      updateData.repliedBy = repliedBy;
      updateData.repliedAt = new Date();
    }

    const updatedContact = await AdminContact.findByIdAndUpdate(
      contactId,
      updateData,
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      contact: {
        id: updatedContact._id,
        referenceId: updatedContact.referenceId,
        name: updatedContact.name,
        email: updatedContact.email,
        subject: updatedContact.subject,
        message: updatedContact.message,
        status: updatedContact.status,
        timestamp: updatedContact.timestamp,
        reply: updatedContact.reply,
        repliedBy: updatedContact.repliedBy,
        repliedAt: updatedContact.repliedAt,
      },
    });

  } catch (error: any) {
    console.error('Update admin contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

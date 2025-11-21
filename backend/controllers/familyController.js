const FamilyMember = require('../models/FamilyMember');
const HealthRecord = require('../models/HealthRecord');

// Add new family member
const addFamilyMember = async (req, res) => {
  try {
    const { name, age, relation, gender, bloodGroup, dateOfBirth, allergies, chronicConditions } = req.body;
    const userId = req.user.userId;

    // Check if member already exists for this user
    const existingMember = await FamilyMember.findOne({ userId, name });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Family member with this name already exists'
      });
    }

    const familyMember = new FamilyMember({
      userId,
      name,
      age,
      relation,
      gender,
      bloodGroup,
      dateOfBirth,
      allergies: allergies || [],
      chronicConditions: chronicConditions || []
    });

    await familyMember.save();

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: familyMember
    });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding family member',
      error: error.message
    });
  }
};

// Get all family members for user
const getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const familyMembers = await FamilyMember.find({ userId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Family members retrieved successfully',
      data: familyMembers
    });
  } catch (error) {
    console.error('Error retrieving family members:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving family members',
      error: error.message
    });
  }
};

// Update family member
const updateFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    const familyMember = await FamilyMember.findOne({ _id: memberId, userId });
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Prevent updating name if it would create duplicate
    if (updates.name && updates.name !== familyMember.name) {
      const existingMember = await FamilyMember.findOne({ 
        userId, 
        name: updates.name,
        _id: { $ne: memberId }
      });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Another family member with this name already exists'
        });
      }
    }

    Object.assign(familyMember, updates);
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: 'Family member updated successfully',
      data: familyMember
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating family member',
      error: error.message
    });
  }
};

// Delete family member (soft delete)
const deleteFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.userId;

    const familyMember = await FamilyMember.findOne({ _id: memberId, userId });
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    familyMember.isActive = false;
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: 'Family member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting family member',
      error: error.message
    });
  }
};

// Upload health record - Store file in MongoDB
const uploadHealthRecord = async (req, res) => {
  try {
    const { memberId, recordType, title, description, recordDate, doctorName, hospitalName, tags } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Verify family member belongs to user
    const familyMember = await FamilyMember.findOne({ _id: memberId, userId, isActive: true });
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Store file directly in MongoDB as Buffer
    const healthRecord = new HealthRecord({
      memberId,
      userId,
      recordType,
      title,
      description,
      fileData: file.buffer, // Store file buffer directly
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      recordDate: recordDate || new Date(),
      doctorName,
      hospitalName,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health record uploaded successfully',
      data: {
        id: healthRecord._id,
        title: healthRecord.title,
        fileName: healthRecord.fileName,
        fileSize: healthRecord.fileSize,
        recordType: healthRecord.recordType,
        recordDate: healthRecord.recordDate
      }
    });
  } catch (error) {
    console.error('Error uploading health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading health record',
      error: error.message
    });
  }
};

// Get health records for family member (metadata only, no file data)
const getHealthRecords = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.userId;
    const { recordType, page = 1, limit = 10 } = req.query;

    // Verify family member belongs to user
    const familyMember = await FamilyMember.findOne({ _id: memberId, userId, isActive: true });
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    const query = { memberId, userId };
    if (recordType) {
      query.recordType = recordType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { recordDate: -1 },
      select: '-fileData' // Exclude file data from list
    };

    const healthRecords = await HealthRecord.find(query)
      .sort({ recordDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('memberId', 'name relation');

    const total = await HealthRecord.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Health records retrieved successfully',
      data: {
        healthRecords,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error retrieving health records:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving health records',
      error: error.message
    });
  }
};

// Download health record file
const downloadHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.userId;

    const healthRecord = await HealthRecord.findOne({ _id: recordId, userId });
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', healthRecord.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${healthRecord.fileName}"`);
    res.setHeader('Content-Length', healthRecord.fileSize);

    // Send file data from Buffer
    res.send(healthRecord.fileData);
  } catch (error) {
    console.error('Error downloading health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading health record',
      error: error.message
    });
  }
};

// View health record file in browser
const viewHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.userId;

    const healthRecord = await HealthRecord.findOne({ _id: recordId, userId });
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Set appropriate headers for inline viewing
    res.setHeader('Content-Type', healthRecord.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${healthRecord.fileName}"`);
    res.setHeader('Content-Length', healthRecord.fileSize);

    // Send file data from Buffer
    res.send(healthRecord.fileData);
  } catch (error) {
    console.error('Error viewing health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error viewing health record',
      error: error.message
    });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.userId;

    const healthRecord = await HealthRecord.findOne({ _id: recordId, userId });
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    await HealthRecord.findByIdAndDelete(recordId);

    res.status(200).json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting health record',
      error: error.message
    });
  }
};

// Get family member with health stats
const getMemberWithStats = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.userId;

    const familyMember = await FamilyMember.findOne({ _id: memberId, userId, isActive: true });
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Get record type counts
    const recordStats = await HealthRecord.aggregate([
      { $match: { memberId: mongoose.Types.ObjectId(memberId), userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Family member details retrieved successfully',
      data: {
        member: familyMember,
        recordStats
      }
    });
  } catch (error) {
    console.error('Error retrieving member details:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving member details',
      error: error.message
    });
  }
};

module.exports = {
  addFamilyMember,
  getFamilyMembers,
  updateFamilyMember,
  deleteFamilyMember,
  uploadHealthRecord,
  getHealthRecords,
  downloadHealthRecord,
  viewHealthRecord,
  deleteHealthRecord,
  getMemberWithStats
};
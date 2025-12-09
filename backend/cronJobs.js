// doctorDailyReset.js
const mongoose = require('mongoose');

async function resetDailyDoctorData() {
    try {
        console.log('🔄 Running daily doctor data reset...');
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Get Doctor model
        const Doctor = mongoose.models.Doctor;
        
        if (!Doctor) {
            console.error('❌ Doctor model not found!');
            return { success: false, error: 'Doctor model not found' };
        }
        
        // 1. Reset expired premium plans
        const expiredResult = await Doctor.updateMany(
            {
                $or: [
                    { 'premiumPlan.expiresAt': { $lt: now } },
                    { 'premiumPlan.isActive': false }
                ]
            },
            {
                $set: {
                    'premiumPlan.patientLimit': 0,
                    'premiumPlan.amount': 0,
                    'premiumPlan.purchasedAt': null,
                    'premiumPlan.expiresAt': null,
                    'premiumPlan.isActive': false,
                    'paymentDetails.razorpayOrderId': null,
                    'paymentDetails.razorpayPaymentId': null,
                    'paymentDetails.razorpaySignature': null,
                    'paymentDetails.paymentDate': null,
                    'paymentDetails.amountPaid': 0,
                    'paymentDetails.paymentStatus': 'inactive',
                    'isAvailableToday': false,
                    'planExpiryReminderSent': false,
                    updatedAt: now
                }
            }
        );

        console.log(`✅ Expired plans reset: ${expiredResult.modifiedCount} doctors updated`);
        
        // 2. Reset daily stats for all doctors (if date is not today)
        const dailyResetResult = await Doctor.updateMany(
            {
                $or: [
                    { 'dailyStats.date': { $lt: todayStart } },
                    { 'dailyStats.date': { $exists: false } }
                ]
            },
            {
                $set: {
                    'dailyStats.patientsConsulted': 0,
                    'dailyStats.date': now,
                    updatedAt: now
                }
            }
        );

        console.log(`📊 Daily stats reset: ${dailyResetResult.modifiedCount} doctors updated`);
        
        // 3. Update maxPatientsAllowed based on plan status - FIXED
        // Get all doctors and update individually
        const doctors = await Doctor.find({});
        
        let premiumUpdated = 0;
        let freeUpdated = 0;
        
        for (const doctor of doctors) {
            if (doctor.premiumPlan && doctor.premiumPlan.isActive && doctor.premiumPlan.patientLimit) {
                // Doctor has active premium plan
                await Doctor.updateOne(
                    { _id: doctor._id },
                    { 
                        $set: { 
                            'dailyStats.maxPatientsAllowed': doctor.premiumPlan.patientLimit,
                            updatedAt: now 
                        } 
                    }
                );
                premiumUpdated++;
            } else {
                // Doctor has free plan or inactive premium plan
                await Doctor.updateOne(
                    { _id: doctor._id },
                    { 
                        $set: { 
                            'dailyStats.maxPatientsAllowed': 5,
                            updatedAt: now 
                        } 
                    }
                );
                freeUpdated++;
            }
        }
        
        console.log(`⭐ Max patients updated: ${premiumUpdated} premium, ${freeUpdated} free doctors`);
        console.log('🎉 Daily reset completed successfully!');
        
        return { 
            success: true, 
            expiredReset: expiredResult.modifiedCount,
            dailyReset: dailyResetResult.modifiedCount,
            premiumUpdated,
            freeUpdated
        };
        
    } catch (error) {
        console.error('❌ Error in daily reset:', error);
        return { success: false, error: error.message };
    }
}

// Alternative: Using aggregation for bulk update
async function updateMaxPatientsBulk() {
    try {
        const Doctor = mongoose.models.Doctor;
        const now = new Date();
        
        // Use aggregation pipeline to update
        const result = await Doctor.aggregate([
            {
                $set: {
                    'dailyStats.maxPatientsAllowed': {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: ['$premiumPlan.isActive', true] },
                                    { $gt: ['$premiumPlan.patientLimit', 0] }
                                ]
                            },
                            then: '$premiumPlan.patientLimit',
                            else: 5
                        }
                    },
                    updatedAt: now
                }
            },
            {
                $merge: {
                    into: 'doctors',
                    whenMatched: 'merge',
                    whenNotMatched: 'discard'
                }
            }
        ]);
        
        console.log(`✅ Bulk update completed`);
        return { success: true };
    } catch (error) {
        console.error('Error in bulk update:', error);
        return { success: false, error: error.message };
    }
}

// Hourly check for expired plans
async function checkExpiredPlansHourly() {
    try {
        const now = new Date();
        const Doctor = mongoose.models.Doctor;
        
        // Find doctors with plans that expired in the last hour
        const recentlyExpired = await Doctor.find({
            'premiumPlan.expiresAt': { 
                $lt: now,
                $gt: new Date(now.getTime() - 60 * 60 * 1000) // Last hour
            },
            'premiumPlan.isActive': true
        });
        
        let expiredCount = 0;
        
        // Update each expired doctor
        for (const doctor of recentlyExpired) {
            await Doctor.updateOne(
                { _id: doctor._id },
                {
                    $set: {
                        'premiumPlan.isActive': false,
                        'premiumPlan.patientLimit': 0,
                        'isAvailableToday': false,
                        'dailyStats.maxPatientsAllowed': 5,
                        updatedAt: now
                    }
                }
            );
            expiredCount++;
        }
        
        if (expiredCount > 0) {
            console.log(`🔄 Hourly check: Updated ${expiredCount} expired plans`);
        }
        return { success: true, expiredCount };
    } catch (error) {
        console.error('Error in hourly check:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { 
    resetDailyDoctorData, 
    checkExpiredPlansHourly,
    updateMaxPatientsBulk 
};
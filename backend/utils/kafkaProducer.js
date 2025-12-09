// utils/kafkaProducer.js - Updated for your CareMitra app
const { Kafka } = require('kafkajs');
require('dotenv').config();

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'caremitra-backend',
            brokers: [process.env.UPSTASH_KAFKA_BROKER],
            ssl: true,
            sasl: {
                mechanism: 'scram-sha-256',
                username: process.env.UPSTASH_KAFKA_REST_USERNAME,
                password: process.env.UPSTASH_KAFKA_REST_PASSWORD
            }
        });
        
        this.producer = this.kafka.producer();
        this.isConnected = false;
    }

    async connect() {
        if (!this.isConnected) {
            try {
                await this.producer.connect();
                this.isConnected = true;
                console.log('✅ Kafka Producer connected successfully');
            } catch (error) {
                console.error('❌ Kafka Producer connection error:', error);
                throw error;
            }
        }
    }

    async sendMessage(topic, message, key = null) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            const payload = {
                topic,
                messages: [
                    {
                        key: key || `${topic}-${Date.now()}`,
                        value: JSON.stringify({
                            ...message,
                            timestamp: new Date().toISOString(),
                            service: 'caremitra-backend'
                        })
                    }
                ]
            };

            const result = await this.producer.send(payload);
            console.log(`📤 Kafka event sent to ${topic}:`, message.event);
            return result;
        } catch (error) {
            console.error(`❌ Kafka error sending to ${topic}:`, error);
            // Don't throw error - continue execution even if Kafka fails
        }
    }

    // Custom methods for YOUR CareMitra events
    async sendLabTestOrderCreated(orderData, userData) {
        return this.sendMessage(
            process.env.KAFKA_TOPIC_LABTEST_ORDER,
            {
                event: 'LABTEST_ORDER_CREATED',
                orderId: orderData._id || orderData.orderId,
                userId: orderData.user,
                tests: orderData.tests,
                totalAmount: orderData.totalAmount,
                sampleCollectionDetails: orderData.sampleCollectionDetails,
                razorpayOrderId: orderData.razorpayOrderId,
                userEmail: userData?.email,
                userPhone: userData?.phone,
                timestamp: new Date().toISOString()
            },
            `order-${orderData._id}`
        );
    }

    async sendPaymentVerified(paymentData, userData) {
        return this.sendMessage(
            process.env.KAFKA_TOPIC_PAYMENT_CONFIRMATION,
            {
                event: 'PAYMENT_VERIFIED',
                orderId: paymentData._id || paymentData.orderId,
                userId: paymentData.user,
                razorpayPaymentId: paymentData.razorpayPaymentId,
                razorpayOrderId: paymentData.razorpayOrderId,
                totalAmount: paymentData.totalAmount,
                userEmail: userData?.email,
                userPhone: userData?.phone,
                timestamp: new Date().toISOString()
            },
            `payment-${paymentData.razorpayPaymentId}`
        );
    }

    async sendSampleCollected(orderData, userData) {
        return this.sendMessage(
            process.env.KAFKA_TOPIC_SAMPLE_COLLECTION,
            {
                event: 'SAMPLE_COLLECTED',
                orderId: orderData._id,
                userId: orderData.user,
                orderStatus: 'sample_collected',
                userEmail: userData?.email,
                userPhone: userData?.phone,
                timestamp: new Date().toISOString()
            },
            `sample-${orderData._id}`
        );
    }

    async sendReportUploaded(orderData, reportData, userData) {
        return this.sendMessage(
            process.env.KAFKA_TOPIC_REPORT_UPLOAD,
            {
                event: 'REPORT_UPLOADED',
                orderId: orderData._id,
                userId: orderData.user,
                reportId: reportData._id,
                reportFileName: reportData.fileName,
                orderStatus: 'completed',
                userEmail: userData?.email,
                userPhone: userData?.phone,
                timestamp: new Date().toISOString()
            },
            `report-${orderData._id}`
        );
    }

    async disconnect() {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('🔌 Kafka Producer disconnected');
        }
    }
}

// Create singleton instance
const kafkaProducer = new KafkaProducer();

// Auto-connect on import in production
if (process.env.NODE_ENV === 'production') {
    kafkaProducer.connect().catch(console.error);
}

module.exports = kafkaProducer;
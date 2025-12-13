import { Request, Response } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { env } from '../config/validateEnv';
import Meeting from '../models/Meeting';

const receiver = new WebhookReceiver(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

export const handleLiveKitWebhook = async (req: Request, res: Response) => {
    try {
        const event = await receiver.receive(req.body, req.headers.authorization);

        // console.log('LiveKit Webhook Event:', event.event);

        if (event.event === 'room_started') {
            const code = event.room?.name;
            if (code) {
                await Meeting.findOneAndUpdate(
                    { code },
                    { isActive: true, startTime: new Date() }
                );
            }
        } else if (event.event === 'room_finished') {
            const code = event.room?.name;
            if (code) {
                await Meeting.findOneAndUpdate(
                    { code },
                    { isActive: false, endTime: new Date() }
                );
            }
        } else if (event.event === 'participant_left') {
            const code = event.room?.name;
            const userId = event.participant?.identity;

            if (code && userId) {
                // Find meeting and update specific participant's leftAt
                await Meeting.findOneAndUpdate(
                    { code, 'participants.userId': userId },
                    {
                        $set: {
                            'participants.$.leftAt': new Date()
                        }
                    }
                );
            }
        }

        res.status(200).send('ok');
    } catch (error) {
        console.error('Error handling LiveKit webhook:', error);
        res.status(500).send('Webhook error');
    }
};

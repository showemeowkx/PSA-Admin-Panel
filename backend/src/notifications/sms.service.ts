/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TurboSmsResponse {
  response_code: number;
  response_status: string;
  response_result?: Array<{ message_id: string }>;
}

@Injectable()
export class SmsService {
  private logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://api.turbosms.ua/message/send.json';

  constructor(private readonly configService: ConfigService) {}

  sendVerificationCodeMock(phoneNumber: string, code: string): void {
    this.logger.debug(`[MOCK SMS] To: ${phoneNumber} | Code: ${code}`);
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const token = this.configService.get<string>('TURBOSMS_TOKEN');
    const sender = this.configService.get<string>('TURBOSMS_SENDER', 'Msg');

    const recipient = phoneNumber.replace('+', '').replaceAll(' ', '');
    const expiresIn =
      this.configService.get<number>('VERIFICATION_CODE_EXPIRE_MINUTES') || 5;
    const text = `Ваш код для реєстрації: ${code},\nДійсний протягом ${expiresIn} хвилин.`;

    const payload = {
      recipients: [recipient],
      sms: {
        sender,
        text,
      },
    };

    try {
      this.logger.debug(`Sending SMS to ${phoneNumber} via TurboSMS...`);

      const response = await axios.post<TurboSmsResponse>(
        this.apiUrl,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (
        response.data.response_code === 0 ||
        response.data.response_code === 800
      ) {
        this.logger.log(
          `SMS sent successfully. ID: ${response.data.response_result?.[0]?.message_id}`,
        );
      } else {
        this.logger.error(`TurboSMS error: ${response.data.response_status}`);
        throw new Error('SMS provider error');
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.stack}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';

export
@Injectable()
class SmsService {
  private logger = new Logger(SmsService.name);

  // MOCK SMS
  sendVerificationCode(phoneNumber: string, code: string): void {
    this.logger.debug(`[MOCK SMS] To: ${phoneNumber} | Code: ${code}`);
  }
}

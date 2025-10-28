import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { appConfig } from 'src/appConfig';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

cloudinaryV2.config({
  cloud_name: appConfig.cloudinary.cloudName,
  api_key: appConfig.cloudinary.apiKey,
  api_secret: appConfig.cloudinary.apiSecret,
});

@Injectable()
export class ProfileService {
  async generateProfileImage(
    username: string,
    avatarUrl?: string,
    badges: string[] = [],
    score: number = 0,
    joinDate: string = ''
  ): Promise<Buffer> {
    const badgesPerRow = 5;
    const badgeHeight = 40;
    const badgeGapY = 15;
    const badgeRows = Math.ceil(badges.length / badgesPerRow);
    const extraHeight = badgeRows > 1 ? (badgeRows - 1) * (badgeHeight + badgeGapY) : 0;

    const width = 1000;
    const height = 300 + extraHeight;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#141E30');
    gradient.addColorStop(1, '#243B55');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 40) {
        ctx.fillRect(i, j, 20, 20);
      }
    }

    const avatarSize = 200;
    const avatarX = 50;
    const avatarY = (300 - avatarSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    if (avatarUrl) {
      try {
        const avatar = await loadImage(avatarUrl);
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      } catch {
        ctx.fillStyle = '#888';
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      }
    } else {
      ctx.fillStyle = '#999';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 90px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(username[0].toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.stroke();

    const infoX = avatarX + avatarSize + 80;
    let y = avatarY + 60;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(username, infoX, y);

    const rightColumnX = width - 350;
    ctx.textAlign = 'left';
    ctx.font = '25px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🏆 Score: ${score}`, width - 350, y - 10);

    ctx.font = '25px Arial';
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText(`📅 Join at: ${joinDate}`, width - 350, y + 30);

    y += 80;
    let badgeX = infoX;
    const maxWidth = width - 50;
    const badgeGapX = 16;

    ctx.font = '20px Arial';
    for (const badgeText of badges) {
      const paddingX = 16;
      const textWidth = ctx.measureText(badgeText).width;
      const badgeWidth = textWidth + paddingX * 2;

      if (badgeX + badgeWidth > maxWidth) {
        badgeX = infoX;
        y += badgeHeight + badgeGapY;
      }

      const radius = 14;
      ctx.beginPath();
      ctx.moveTo(badgeX + radius, y);
      ctx.lineTo(badgeX + badgeWidth - radius, y);
      ctx.quadraticCurveTo(badgeX + badgeWidth, y, badgeX + badgeWidth, y + radius);
      ctx.lineTo(badgeX + badgeWidth, y + badgeHeight - radius);
      ctx.quadraticCurveTo(badgeX + badgeWidth, y + badgeHeight, badgeX + badgeWidth - radius, y + badgeHeight);
      ctx.lineTo(badgeX + radius, y + badgeHeight);
      ctx.quadraticCurveTo(badgeX, y + badgeHeight, badgeX, y + badgeHeight - radius);
      ctx.lineTo(badgeX, y + radius);
      ctx.quadraticCurveTo(badgeX, y, badgeX + radius, y);
      ctx.closePath();

      const colors = ['#FFD54F', '#81C784', '#64B5F6', '#BA68C8', '#F06292'];
      ctx.fillStyle = colors[badges.indexOf(badgeText) % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + badgeWidth / 2, y + badgeHeight / 2 + 1);

      badgeX += badgeWidth + badgeGapX;
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    return canvas.toBuffer('image/png');
  }

  async uploadProfileImage(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinaryV2.uploader.upload_stream(
        { public_id: publicId, overwrite: true, resource_type: 'image' },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result returned from Cloudinary"));
          resolve(result);
        }
      ).end(buffer);
    });
  }
}

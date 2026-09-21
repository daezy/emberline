import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const mapString =
  (fn: (value: string) => string) =>
  ({ value }: { value: unknown }) =>
    typeof value === 'string' ? fn(value) : value;

export const Trimmed = () => Transform(mapString((value) => value.trim()));

export const NormalizedEmail = () =>
  applyDecorators(
    Transform(mapString((value) => value.trim().toLowerCase())),
    IsEmail(),
    MaxLength(254),
  );

export const PasswordField = (minLength = 1) =>
  applyDecorators(IsString(), MinLength(minLength), MaxLength(128));

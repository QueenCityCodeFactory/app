<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Generic workflow status with Bootstrap color mapping.
 */
enum Status: string implements LabeledEnum
{
    use HasLabeledOptionsTrait;

    case Draft = 'draft';
    case Active = 'active';
    case Inactive = 'inactive';
    case Archived = 'archived';

    /**
     * @inheritDoc
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            self::Inactive => 'Inactive',
            self::Archived => 'Archived',
        };
    }

    /**
     * Bootstrap contextual color.
     */
    public function color(): string
    {
        return match ($this) {
            self::Draft => 'secondary',
            self::Active => 'success',
            self::Inactive => 'warning',
            self::Archived => 'dark',
        };
    }
}

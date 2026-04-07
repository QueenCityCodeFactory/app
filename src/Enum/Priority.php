<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Generic priority levels with Bootstrap color mapping.
 */
enum Priority: string implements LabeledEnum
{
    use HasLabeledOptionsTrait;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    /**
     * @inheritDoc
     */
    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
            self::Critical => 'Critical',
        };
    }

    /**
     * Bootstrap contextual color.
     */
    public function color(): string
    {
        return match ($this) {
            self::Low => 'secondary',
            self::Medium => 'info',
            self::High => 'warning',
            self::Critical => 'danger',
        };
    }
}

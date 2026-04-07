<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Convenience methods for backed enums that implement LabeledEnum.
 *
 * Provides the common helpers that the old AbstractEnum class offered,
 * now backed by native PHP enums.
 *
 * Usage:
 * ```
 * enum Priority: string implements LabeledEnum
 * {
 *     use HasLabeledOptions;
 *     case Low = 'low';
 *     // ...
 *     public function label(): string { ... }
 * }
 *
 * Priority::options();        // ['low' => 'Low', ...]
 * Priority::values();         // ['low', 'medium', ...]
 * Priority::from('low')->label(); // 'Low'
 * ```
 */
trait HasLabeledOptions
{
    /**
     * Value => Label map suitable for `Form->control('field', ['options' => ...])`.
     *
     * @return array<string|int, string>
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->label();
        }

        return $options;
    }

    /**
     * All backed values — useful for `inList()` validation rules.
     *
     * @return list<string|int>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * All display labels.
     *
     * @return list<string>
     */
    public static function labels(): array
    {
        return array_map(fn (self $case) => $case->label(), self::cases());
    }
}

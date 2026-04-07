<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Contract for backed enums that carry a human-readable label.
 *
 * Implement on any `string`- or `int`-backed enum and pair
 * with the `HasLabeledOptionsTrait` trait for a full API.
 */
interface LabeledEnum
{
    /**
     * Human-readable display label for this case.
     */
    public function label(): string;
}

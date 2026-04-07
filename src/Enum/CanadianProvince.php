<?php
declare(strict_types=1);

namespace App\Enum;

/**
 * Canadian provinces and territories.
 *
 * Backed value is the two-letter postal abbreviation.
 * `label()` returns the full name.
 */
enum CanadianProvince: string implements LabeledEnum
{
    use HasLabeledOptions;

    case AB = 'AB';
    case BC = 'BC';
    case MB = 'MB';
    case NB = 'NB';
    case NL = 'NL';
    case NS = 'NS';
    case NT = 'NT';
    case NU = 'NU';
    case ON = 'ON';
    case PE = 'PE';
    case QC = 'QC';
    case SK = 'SK';
    case YT = 'YT';

    public function label(): string
    {
        return match ($this) {
            self::AB => 'Alberta',
            self::BC => 'British Columbia',
            self::MB => 'Manitoba',
            self::NB => 'New Brunswick',
            self::NL => 'Newfoundland and Labrador',
            self::NS => 'Nova Scotia',
            self::NT => 'Northwest Territories',
            self::NU => 'Nunavut',
            self::ON => 'Ontario',
            self::PE => 'Prince Edward Island',
            self::QC => 'Quebec',
            self::SK => 'Saskatchewan',
            self::YT => 'Yukon',
        };
    }
}

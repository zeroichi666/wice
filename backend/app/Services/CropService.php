<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Item;
use Illuminate\Support\Facades\DB;

class CropService
{
    /**
     * Water decay rate: lose 5% per 10 seconds
     */
    private const WATER_DECAY_RATE = 5;

    /**
     * Stage progression based on growth_time percentage
     */
    private const STAGES = [
        0   => 'seed',
        25  => 'sprout',
        50  => 'growing',
        100 => 'ready',
    ];

    /**
     * Update crop stage and water_level based on elapsed time.
     * Saves to DB if changes detected.
     */
    public function updateCropState(Crop $crop): Crop
    {
        $now = now();
        $plantedAt = $crop->planted_at;
        $item = $crop->item;

        if (!$item || !$plantedAt) {
            return $crop;
        }

        // Calculate growth time
        $growthTime = $item->growth_time ?? 0;
        $elapsed = $now->diffInSeconds($plantedAt);
        $progress = $growthTime > 0 ? min(100, ($elapsed / $growthTime) * 100) : 0;

        // Determine stage
        $newStage = 'seed';
        foreach (self::STAGES as $threshold => $stage) {
            if ($progress >= $threshold) {
                $newStage = $stage;
            }
        }

        // Calculate water_level decay
        $lastWatered = $crop->last_watered_at ?? $plantedAt;
        $secondsSinceWater = $now->diffInSeconds($lastWatered);
        $decaySteps = floor($secondsSinceWater / 10);
        $waterDecay = $decaySteps * self::WATER_DECAY_RATE;
        $newWaterLevel = max(0, $crop->water_level - $waterDecay);

        // Calculate time_to_ready
        $timeToReady = max(0, $growthTime - $elapsed);

        // Save if changed
        if ($newStage !== $crop->stage || $newWaterLevel !== $crop->water_level) {
            $crop->update([
                'stage' => $newStage,
                'water_level' => $newWaterLevel,
            ]);
        }

        // Attach computed values (not saved to DB)
        $crop->time_to_ready = $timeToReady;

        return $crop;
    }

    /**
     * Update all crops for a user
     */
    public function updateAllUserCrops(int $userId): void
    {
        Crop::where('user_id', $userId)
            ->where('stage', '!=', 'ready')
            ->whereNull('harvested_at')
            ->with('item')
            ->each(fn(Crop $crop) => $this->updateCropState($crop));
    }
}

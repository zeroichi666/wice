<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:20', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['username'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Auto-login after register
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            'Registration successful',
            [
                'user' => $user->only(['id', 'name', 'username', 'email', 'coins', 'level']),
                'token' => $token,
            ],
            201
        );
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($validated)) {
            return $this->error('Invalid credentials', [], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            'Login successful',
            [
                'user' => $user->only(['id', 'name', 'username', 'email', 'coins', 'level']),
                'token' => $token,
            ]
        );
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success('Logged out successfully');
    }

    /**
     * Get authenticated user data
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success(
            'User data retrieved',
            $user->only(['id', 'name', 'username', 'email', 'coins', 'level', 'created_at'])
        );
    }
}

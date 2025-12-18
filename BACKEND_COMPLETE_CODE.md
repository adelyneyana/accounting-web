# Complete Backend Code - Accounting Web Application

## 1. MODELS

### app/Models/User.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'taxpayer_type',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function taxEntries()
    {
        return $this->hasMany(TaxEntry::class);
    }

    public function files()
    {
        return $this->hasMany(FileRecord::class);
    }
}
```

### app/Models/TaxEntry.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'value',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'value' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### app/Models/FileRecord.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileRecord extends Model
{
    use HasFactory;

    protected $table = 'files';

    protected $fillable = [
        'user_id',
        'filename',
        'path',
        'mime',
        'size',
        'storage',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## 2. CONTROLLERS

### app/Http/Controllers/AuthController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'taxpayer_type' => 'individual',
            ]);

            // Create default tax entries for the user
            $defaultEntries = [
                ['label' => 'Sales', 'value' => 0],
                ['label' => 'VAT Expense', 'value' => 0],
                ['label' => 'Other Expense', 'value' => 0],
                ['label' => 'Asset Purchase', 'value' => 0],
            ];

            foreach ($defaultEntries as $entry) {
                $user->taxEntries()->create([
                    'label' => $entry['label'],
                    'value' => $entry['value'],
                    'meta' => ['editable' => true, 'min' => 0, 'max' => 100000000],
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Revoke all existing tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        return response()->json($request->user(), 200);
    }
}
```

### app/Http/Controllers/TaxController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaxEntry;

class TaxController extends Controller
{
    /**
     * Get all tax entries for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            // Return demo data for unauthenticated requests
            return response()->json([
                'type' => 'individual',
                'entries' => [
                    ['id' => 1, 'label' => 'Sales', 'value' => 500000],
                    ['id' => 2, 'label' => 'VAT Expense', 'value' => 50000],
                    ['id' => 3, 'label' => 'Other Expense', 'value' => 100000],
                    ['id' => 4, 'label' => 'Asset Purchase', 'value' => 0],
                ],
            ]);
        }

        $entries = $user->taxEntries()->orderBy('id')->get()->map(function ($entry) {
            return [
                'id' => $entry->id,
                'label' => $entry->label,
                'value' => (float) $entry->value,
            ];
        });

        return response()->json([
            'type' => $user->taxpayer_type ?? 'individual',
            'entries' => $entries,
        ], 200);
    }

    /**
     * Create a new tax entry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'value' => 'required|numeric|min:0',
            'meta' => 'nullable|array',
        ]);

        try {
            $entry = $request->user()->taxEntries()->create($validated);

            return response()->json([
                'id' => $entry->id,
                'label' => $entry->label,
                'value' => (float) $entry->value,
                'message' => 'Tax entry created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create tax entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a tax entry
     */
    public function update(Request $request, TaxEntry $taxEntry)
    {
        // Check authorization
        if ($taxEntry->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'value' => 'required|numeric|min:0',
            'label' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
        ]);

        try {
            $taxEntry->update($validated);

            return response()->json([
                'id' => $taxEntry->id,
                'label' => $taxEntry->label,
                'value' => (float) $taxEntry->value,
                'message' => 'Tax entry updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update tax entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a tax entry
     */
    public function destroy(Request $request, TaxEntry $taxEntry)
    {
        // Check authorization
        if ($taxEntry->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $taxEntry->delete();

            return response()->json([
                'message' => 'Tax entry deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete tax entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user's taxpayer type
     */
    public function updateType(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:individual,corporation',
        ]);

        try {
            $request->user()->update([
                'taxpayer_type' => $validated['type'],
            ]);

            return response()->json([
                'type' => $request->user()->taxpayer_type,
                'message' => 'Taxpayer type updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update taxpayer type',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate tax based on entries and taxpayer type
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'entries' => 'required|array',
            'type' => 'required|in:individual,corporation',
        ]);

        try {
            $entries = collect($validated['entries']);
            
            $sales = (float) $entries->firstWhere('label', 'Sales')['value'] ?? 0;
            $vatExpense = (float) $entries->firstWhere('label', 'VAT Expense')['value'] ?? 0;
            $otherExpense = (float) $entries->firstWhere('label', 'Other Expense')['value'] ?? 0;
            $assets = (float) $entries->firstWhere('label', 'Asset Purchase')['value'] ?? 0;

            $taxableIncome = max($sales - $vatExpense - $otherExpense, 0);
            
            $taxDue = 0;
            $rateApplied = 0;

            if ($validated['type'] === 'individual') {
                // Graduated tax calculation
                if ($taxableIncome <= 250000) {
                    $taxDue = 0;
                } elseif ($taxableIncome <= 400000) {
                    $taxDue = ($taxableIncome - 250000) * 0.15;
                } elseif ($taxableIncome <= 800000) {
                    $taxDue = 22500 + ($taxableIncome - 400000) * 0.20;
                } elseif ($taxableIncome <= 2000000) {
                    $taxDue = 102500 + ($taxableIncome - 800000) * 0.25;
                } elseif ($taxableIncome <= 8000000) {
                    $taxDue = 402500 + ($taxableIncome - 2000000) * 0.30;
                } else {
                    $taxDue = 2202500 + ($taxableIncome - 8000000) * 0.35;
                }
            } elseif ($validated['type'] === 'corporation') {
                if ($taxableIncome < 5000000 && $assets < 100000000) {
                    $rateApplied = 0.20;
                } else {
                    $rateApplied = 0.25;
                }
                $taxDue = $taxableIncome * $rateApplied;
            }

            return response()->json([
                'taxable_income' => round($taxableIncome, 2),
                'tax_due' => round($taxDue, 2),
                'rate_applied' => $rateApplied,
                'taxpayer_type' => $validated['type'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to calculate tax',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

### app/Http/Controllers/FileController.php
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FileRecord;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    /**
     * Get all files for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $files = $request->user()->files()
                ->latest()
                ->get()
                ->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->filename,
                        'description' => $file->meta['description'] ?? '',
                        'filename' => $file->filename,
                        'size' => $file->size,
                        'mime' => $file->mime,
                        'created_at' => $file->created_at,
                    ];
                });

            return response()->json($files, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch files',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload a new file
     */
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $file = $request->file('file');
            $userId = $request->user()->id;
            
            // Store file with user directory
            $path = $file->store("user_uploads/{$userId}", 'public');
            
            $fileRecord = FileRecord::create([
                'user_id' => $userId,
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'storage' => 'public',
                'meta' => [
                    'description' => $validated['description'] ?? '',
                    'original_name' => $file->getClientOriginalName(),
                ],
            ]);

            return response()->json([
                'id' => $fileRecord->id,
                'name' => $fileRecord->filename,
                'description' => $validated['description'] ?? '',
                'filename' => $fileRecord->filename,
                'size' => $fileRecord->size,
                'path' => $path,
                'message' => 'File uploaded successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a file
     */
    public function download(Request $request, FileRecord $file)
    {
        try {
            // Check authorization
            if ($file->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            if (!Storage::disk('public')->exists($file->path)) {
                return response()->json([
                    'message' => 'File not found',
                ], 404);
            }

            return Storage::disk('public')->download($file->path, $file->filename);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to download file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a file
     */
    public function destroy(Request $request, FileRecord $file)
    {
        try {
            // Check authorization
            if ($file->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Delete file from storage
            if (Storage::disk('public')->exists($file->path)) {
                Storage::disk('public')->delete($file->path);
            }

            $file->delete();

            return response()->json([
                'message' => 'File deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update file metadata
     */
    public function updateMetadata(Request $request, FileRecord $file)
    {
        // Check authorization
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $meta = $file->meta ?? [];
            $meta['description'] = $validated['description'] ?? '';
            
            $file->update([
                'meta' => $meta,
            ]);

            return response()->json([
                'message' => 'File metadata updated successfully',
                'file' => $file,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update file metadata',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

---

## 3. MIGRATIONS

### database/migrations/0001_01_01_000000_create_users_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('taxpayer_type', ['individual', 'corporation'])->default('individual');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
```

### database/migrations/2025_01_01_000001_create_tax_entries_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('value', 18, 2)->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('label');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_entries');
    }
};
```

### database/migrations/2025_01_01_000002_create_files_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('filename');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->bigInteger('size')->nullable();
            $table->string('storage')->default('public');
            $table->json('meta')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
```

### database/migrations/2025_11_26_070932_create_personal_access_tokens_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
```

### database/migrations/2025_01_01_000003_create_cache_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
```

### database/migrations/2025_01_01_000004_create_jobs_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at')->default(0);
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
    }
};
```

---

## 4. SEEDER

### database/seeders/DatabaseSeeder.php
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TaxEntry;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test individual user
        $userIndividual = User::create([
            'name' => 'John Individual',
            'email' => 'individual@example.com',
            'password' => Hash::make('password123'),
            'taxpayer_type' => 'individual',
        ]);

        // Create tax entries for individual
        $individualEntries = [
            ['label' => 'Sales', 'value' => 500000],
            ['label' => 'VAT Expense', 'value' => 50000],
            ['label' => 'Other Expense', 'value' => 100000],
            ['label' => 'Asset Purchase', 'value' => 0],
        ];

        foreach ($individualEntries as $entry) {
            TaxEntry::create([
                'user_id' => $userIndividual->id,
                'label' => $entry['label'],
                'value' => $entry['value'],
                'meta' => ['editable' => true, 'min' => 0, 'max' => 100000000],
            ]);
        }

        // Create test corporation user
        $userCorporation = User::create([
            'name' => 'ABC Corporation',
            'email' => 'corporation@example.com',
            'password' => Hash::make('password123'),
            'taxpayer_type' => 'corporation',
        ]);

        // Create tax entries for corporation
        $corporationEntries = [
            ['label' => 'Sales', 'value' => 10000000],
            ['label' => 'VAT Expense', 'value' => 1000000],
            ['label' => 'Other Expense', 'value' => 2000000],
            ['label' => 'Asset Purchase', 'value' => 50000000],
        ];

        foreach ($corporationEntries as $entry) {
            TaxEntry::create([
                'user_id' => $userCorporation->id,
                'label' => $entry['label'],
                'value' => $entry['value'],
                'meta' => ['editable' => true, 'min' => 0, 'max' => 500000000],
            ]);
        }
    }
}
```

---

## 5. ROUTES

### routes/api.php
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\FileController;

Route::prefix('')->group(function () {
    // Public routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public tax preview (for demo)
    Route::get('/tax', [TaxController::class, 'index']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth routes
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Tax routes
        Route::post('/tax', [TaxController::class, 'store']);
        Route::put('/tax/{taxEntry}', [TaxController::class, 'update']);
        Route::put('/tax/type/update', [TaxController::class, 'updateType']);
        Route::post('/tax/calculate', [TaxController::class, 'calculate']);
        Route::delete('/tax/{taxEntry}', [TaxController::class, 'destroy']);

        // File routes
        Route::get('/files', [FileController::class, 'index']);
        Route::post('/files/upload', [FileController::class, 'upload']);
        Route::get('/files/{file}/download', [FileController::class, 'download']);
        Route::put('/files/{file}/metadata', [FileController::class, 'updateMetadata']);
        Route::delete('/files/{file}', [FileController::class, 'destroy']);
    });
});
```

---

## 6. CONFIGURATION FILES

### config/sanctum.php
```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ',' . parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

### config/cors.php
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:8000')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### config/filesystems.php (relevant parts)
```php
<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'private',
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'public',
        ],
    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
```

---

## 7. ENV CONFIGURATION

### .env (Backend)
```
APP_NAME="Accounting Web"
APP_ENV=local
APP_KEY=base64:xxxxx (generate with: php artisan key:generate)
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:8000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:8000

FILESYSTEM_DISK=public
```

---

## 8. SETUP INSTRUCTIONS

### Installation Steps:

1. **Install Dependencies:**
   ```bash
   composer install
   ```

2. **Generate App Key:**
   ```bash
   php artisan key:generate
   ```

3. **Create Database:**
   - Create MySQL database named `accounting_db`

4. **Run Migrations:**
   ```bash
   php artisan migrate
   ```

5. **Seed Database:**
   ```bash
   php artisan db:seed
   ```

6. **Create Storage Link:**
   ```bash
   php artisan storage:link
   ```

7. **Start Server:**
   ```bash
   php artisan serve --port 8000
   ```

---

## 9. API ENDPOINTS SUMMARY

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)
- `GET /api/me` - Get current user info (requires auth)

### Tax Management
- `GET /api/tax` - Get tax entries (public or authenticated)
- `POST /api/tax` - Create tax entry (requires auth)
- `PUT /api/tax/{id}` - Update tax entry (requires auth)
- `DELETE /api/tax/{id}` - Delete tax entry (requires auth)
- `PUT /api/tax/type/update` - Update taxpayer type (requires auth)
- `POST /api/tax/calculate` - Calculate tax (requires auth)

### File Management
- `GET /api/files` - Get all user files (requires auth)
- `POST /api/files/upload` - Upload file (requires auth)
- `GET /api/files/{id}/download` - Download file (requires auth)
- `PUT /api/files/{id}/metadata` - Update file metadata (requires auth)
- `DELETE /api/files/{id}` - Delete file (requires auth)

---

## 10. RESPONSE FORMATS

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error"
}
```

### Validation Error Response
```json
{
  "message": "Validation failed",
  "errors": {
    "field": ["error message"]
  }
}
```

---

## 11. TAX CALCULATION FORMULAS

### Individual Taxpayer (Graduated Rates)
- ₱0 - ₱250,000: 0%
- ₱250,000 - ₱400,000: 15% of excess over ₱250,000
- ₱400,000 - ₱800,000: ₱22,500 + 20% of excess over ₱400,000
- ₱800,000 - ₱2M: ₱102,500 + 25% of excess over ₱800,000
- ₱2M - ₱8M: ₱402,500 + 30% of excess over ₱2M
- Over ₱8M: ₱2,202,500 + 35% of excess over ₱8M

### Corporate Taxpayer
- 20% if Net Income < ₱5M AND Assets < ₱100M
- 25% otherwise

---


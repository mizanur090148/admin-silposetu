<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('admin.login');
        }

        if ($user->account_type !== 'admin') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->with('error', 'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে। শুধুমাত্র অ্যাডমিনদের প্রবেশাধিকার রয়েছে।');
        }

        if ($user->status === 'suspended') {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->with('error', 'আপনার অ্যাডমিন অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে।');
        }

        return $next($request);
    }
}

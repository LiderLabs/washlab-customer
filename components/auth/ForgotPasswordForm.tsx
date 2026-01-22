'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

type ForgotPasswordStep = 'request' | 'verify' | 'reset'

export default function ForgotPasswordForm() {
    const { isLoaded, signIn, setActive } = useSignIn()
    const router = useRouter()
    
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [step, setStep] = useState<ForgotPasswordStep>('request')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-8">
                <Icons.spinner className="size-6 animate-spin" />
            </div>
        )
    }

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters'
        }
        return null
    }

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!signIn || isLoading) return

        if (!email.trim()) {
            setErrors({ email: 'Email is required' })
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Please enter a valid email address' })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            })

            toast.success('Reset code sent! Check your email.')
            setStep('verify')
        } catch (err: unknown) {
            console.error('Password reset request error:', err)
            if (err && typeof err === 'object' && 'errors' in err) {
                const clerkErrors = err.errors as Array<{ code: string, message: string }>
                const errorMessage = clerkErrors[0]?.message || 'Failed to send reset code'
                setErrors({ email: errorMessage })
            } else {
                setErrors({ email: 'An unexpected error occurred. Please try again.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!signIn || isLoading) return

        if (!code.trim()) {
            setErrors({ code: 'Verification code is required' })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
            })

            if (result.status === 'needs_new_password') {
                toast.success('Code verified! Now set your new password.')
                setStep('reset')
            }
        } catch (err: unknown) {
            console.error('Code verification error:', err)
            if (err && typeof err === 'object' && 'errors' in err) {
                const clerkErrors = err.errors as Array<{ code: string, message: string }>
                const errorMessage = clerkErrors[0]?.message || 'Invalid or expired code'
                setErrors({ code: errorMessage })
            } else {
                setErrors({ code: 'An unexpected error occurred. Please try again.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!signIn || isLoading) return

        const newErrors: Record<string, string> = {}

        if (!newPassword) {
            newErrors.newPassword = 'New password is required'
        } else {
            const passwordError = validatePassword(newPassword)
            if (passwordError) {
                newErrors.newPassword = passwordError
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const result = await signIn.resetPassword({
                password: newPassword,
            })

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId })
                toast.success('Password reset successfully!')
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            console.error('Password reset error:', err)
            if (err && typeof err === 'object' && 'errors' in err) {
                const clerkErrors = err.errors as Array<{ code: string, message: string }>
                const errorMessage = clerkErrors[0]?.message || 'Failed to reset password'
                setErrors({ newPassword: errorMessage })
            } else {
                setErrors({ newPassword: 'An unexpected error occurred. Please try again.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (!signIn || isLoading) return
        
        setIsLoading(true)
        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            })
            toast.success('New reset code sent!')
        } catch (err) {
            console.error('Resend error:', err)
            toast.error('Failed to resend code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset Password
    if (step === 'reset') {
        return (
            <div className={cn("flex flex-col gap-6")}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Choose a strong password for your account
                    </p>
                </div>
                <form onSubmit={handleResetPassword} className="grid gap-5">
                    {errors.general && (
                        <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value)
                                clearError('newPassword')
                            }}
                            required
                            className={errors.newPassword ? 'border-destructive' : ''}
                        />
                        {errors.newPassword && (
                            <div className="text-sm text-destructive">{errors.newPassword}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                clearError('confirmPassword')
                            }}
                            required
                            className={errors.confirmPassword ? 'border-destructive' : ''}
                        />
                        {errors.confirmPassword && (
                            <div className="text-sm text-destructive">{errors.confirmPassword}</div>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs space-y-2 p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-muted-foreground">Password requirements:</p>
                        <ul className="space-y-1">
                            <li className={cn(
                                "flex items-center gap-2",
                                newPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"
                            )}>
                                {newPassword.length >= 8 ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <span className="h-3 w-3 flex items-center justify-center">•</span>
                                )}
                                At least 8 characters
                            </li>
                        </ul>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Icons.spinner className="size-4 animate-spin mr-2" />
                                Resetting password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </div>
        )
    }

    // Step 2: Verify Code
    if (step === 'verify') {
        return (
            <div className={cn("flex flex-col gap-6")}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Verify Reset Code</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Enter the verification code sent to <span className="font-medium">{email}</span>
                    </p>
                </div>
                <form onSubmit={handleVerifyCode} className="grid gap-6">
                    {errors.general && (
                        <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value)
                                clearError('code')
                            }}
                            required
                            className={errors.code ? 'border-destructive' : ''}
                            maxLength={6}
                        />
                        {errors.code && (
                            <div className="text-sm text-destructive">{errors.code}</div>
                        )}
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Icons.spinner className="size-4 animate-spin mr-2" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </Button>
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleResendCode}
                            disabled={isLoading}
                        >
                            Resend code
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setStep('request')
                                setCode('')
                                setErrors({})
                            }}
                            disabled={isLoading}
                        >
                            Use different email
                        </Button>
                    </div>
                </form>
            </div>
        )
    }

    // Step 1: Request Reset
    return (
        <div className={cn("flex flex-col gap-6")}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a code to reset your password
                </p>
            </div>
            <form onSubmit={handleRequestReset} className="grid gap-6">
                {errors.general && (
                    <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                        {errors.general}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder='john@example.com'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            clearError('email')
                        }}
                        required
                        className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                        <div className="text-sm text-destructive">{errors.email}</div>
                    )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Icons.spinner className="size-4 animate-spin mr-2" />
                            Sending code...
                        </>
                    ) : (
                        'Send Reset Code'
                    )}
                </Button>
            </form>
            <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </div>
    )
}


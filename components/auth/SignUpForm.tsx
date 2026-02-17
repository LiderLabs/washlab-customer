'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@devlider001/washlab-backend/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

interface SignUpFormData {
    emailAddress: string
    firstName: string
    lastName: string
    phoneNumber: string
    password: string
}

export default function SignUpForm() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()
    
    // Convex mutations: register (name/email/phone) and updateProfile to save phone after verification
    const registerCustomer = useMutation(api.customers.register)
    const updateProfile = useMutation(api.customers.updateProfile)
    
    const [formData, setFormData] = useState<SignUpFormData>({
        emailAddress: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: ''
    })
    const [verifying, setVerifying] = useState(false)
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-8">
                <Icons.spinner className="size-6 animate-spin" />
            </div>
        )
    }

    const updateFormData = (field: keyof SignUpFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '')
        // Format as Ghana phone number
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }
        if (!formData.emailAddress.trim()) {
            newErrors.emailAddress = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address'
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required'
        } else {
            const digits = formData.phoneNumber.replace(/\D/g, '')
            if (digits.length < 10) {
                newErrors.phoneNumber = 'Please enter a valid phone number'
            }
        }
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!signUp || isLoading) return

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            // Create Clerk user with email (phone will be stored in Convex)
            await signUp.create({
                emailAddress: formData.emailAddress,
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
            })

            // Send email verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setVerifying(true)
            toast.success('Verification code sent to your email!')
        } catch (err: unknown) {
            console.error('Sign up error:', err)
            if (err && typeof err === 'object' && 'errors' in err) {
                const clerkErrors = err.errors as Array<{ code: string, message: string, meta?: { paramName?: string } }>
                const newErrors: Record<string, string> = {}

                clerkErrors.forEach(error => {
                    if (error.meta?.paramName) {
                        newErrors[error.meta.paramName] = error.message
                    } else {
                        newErrors.general = error.message
                    }
                })
                setErrors(newErrors)
            } else {
                setErrors({ general: 'An unexpected error occurred. Please try again.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!signUp || isLoading) return

        if (!code.trim()) {
            setErrors({ code: 'Verification code is required' })
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (completeSignUp.status === 'complete') {
                // Set the session first
                await setActive({ session: completeSignUp.createdSessionId })
                
                const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
                // Save real phone number (webhook creates customer with "pending-..." placeholder)
                try {
                    await updateProfile({ phoneNumber: phoneDigits })
                } catch (phoneErr) {
                    console.error('Update phone error:', phoneErr)
                    // Continue; user can update phone in profile later
                }

                // Register/update customer in Convex (may throw if webhook already created account)
                try {
                    await registerCustomer({
                        name: `${formData.firstName} ${formData.lastName}`,
                        phoneNumber: phoneDigits,
                        email: formData.emailAddress,
                    })
                    toast.success('Account created successfully!')
                } catch (convexErr) {
                    console.error('Convex registration error:', convexErr)
                    // Account may already exist from webhook; phone was saved above
                    toast.success('Account created successfully!')
                }
                
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            console.error('Verification error:', err)
            if (err && typeof err === 'object' && 'errors' in err) {
                const clerkErrors = err.errors as Array<{ code: string, message: string }>
                const errorMessage = clerkErrors[0]?.message || 'Invalid verification code'
                setErrors({ code: errorMessage })
            } else {
                setErrors({ code: 'An unexpected error occurred. Please try again.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (!signUp || isLoading) return
        
        setIsLoading(true)
        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            toast.success('New verification code sent!')
        } catch (err) {
            console.error('Resend error:', err)
            toast.error('Failed to resend code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Verification Step
    if (verifying) {
        return (
            <div className={cn("flex flex-col gap-6")}>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        We sent a verification code to <span className="font-medium">{formData.emailAddress}</span>
                    </p>
                </div>
                <form onSubmit={handleVerify} className="grid gap-6">
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
                                if (errors.code) {
                                    setErrors(prev => ({ ...prev, code: '' }))
                                }
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
                            'Verify Email'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-muted-foreground"
                    >
                        Didn't receive a code? <span className="text-primary ml-1">Resend</span>
                    </Button>
                </form>
                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </div>
        )
    }

    // Sign Up Form
    return (
        <div className={cn("flex flex-col gap-6")}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Sign up to track orders, earn loyalty points, and more!
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-5">
                {errors.general && (
                    <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                        {errors.general}
                    </div>
                )}
                
                {/* Name Fields */}
                <div className='grid grid-cols-2 gap-3'>
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder='John'
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            required
                            className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && (
                            <div className="text-xs text-destructive">{errors.firstName}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder='Doe'
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            required
                            className={errors.lastName ? 'border-destructive' : ''}
                        />
                        {errors.lastName && (
                            <div className="text-xs text-destructive">{errors.lastName}</div>
                        )}
                    </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center px-3 bg-muted border rounded-md text-sm text-muted-foreground">
                            +233
                        </div>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder='055 123 4567'
                            value={formData.phoneNumber}
                            onChange={(e) => updateFormData('phoneNumber', formatPhoneNumber(e.target.value))}
                            required
                            className={cn("flex-1", errors.phoneNumber ? 'border-destructive' : '')}
                            maxLength={12}
                        />
                    </div>
                    {errors.phoneNumber ? (
                        <div className="text-xs text-destructive">{errors.phoneNumber}</div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Your loyalty points will be linked to this number
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder='john@example.com'
                        value={formData.emailAddress}
                        onChange={(e) => updateFormData('emailAddress', e.target.value)}
                        required
                        className={errors.emailAddress ? 'border-destructive' : ''}
                    />
                    {errors.emailAddress && (
                        <div className="text-xs text-destructive">{errors.emailAddress}</div>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                        className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password ? (
                        <div className="text-xs text-destructive">{errors.password}</div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            At least 8 characters
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Icons.spinner className="size-4 animate-spin mr-2" />
                            Creating account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </Button>
            </form>
            
            <div className="text-center text-sm space-y-2">
                <p>
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
                <p className="text-muted-foreground">
                    Or{" "}
                    <Link href="/order" className="text-primary hover:underline">
                        place an order as guest
                    </Link>
                </p>
            </div>
        </div>
    )
}

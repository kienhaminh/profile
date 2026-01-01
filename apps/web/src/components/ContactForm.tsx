'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendContactEmail, ContactState } from '@/actions/contact';
import { CONTACT } from '@/constants/information';

const initialState: ContactState = {
  success: false,
  message: '',
};

export function ContactForm() {
  const [state, action, isPending] = useActionState(
    sendContactEmail,
    initialState
  );

  return (
    <div className="space-y-6">
      {state.success ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-300">
            Message Sent!
          </h3>
          <p className="text-green-700 dark:text-green-400">{state.message}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Send Another Message
          </Button>
        </div>
      ) : (
        <form action={action} className="space-y-6">
          {state.message && !state.success && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                required
                disabled={isPending}
                aria-invalid={!!state.errors?.name}
              />
              {state.errors?.name && (
                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required
                disabled={isPending}
                aria-invalid={!!state.errors?.email}
              />
              {state.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="What's this about?"
              required
              disabled={isPending}
              aria-invalid={!!state.errors?.subject}
            />
            {state.errors?.subject && (
              <p className="text-sm text-red-500">{state.errors.subject[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              name="message"
              placeholder="Tell me about your project..."
              rows={6}
              required
              className="resize-none"
              disabled={isPending}
              aria-invalid={!!state.errors?.message}
            />
            {state.errors?.message && (
              <p className="text-sm text-red-500">{state.errors.message[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all group"
          >
            {isPending ? (
              <>
                Sending...
                <Loader2 className="ml-2 w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                Send Message
                <Mail className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-center text-muted-foreground mb-4">
          Or reach out directly:
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-muted hover:bg-accent rounded-lg text-foreground transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-muted hover:bg-accent rounded-lg text-foreground transition-colors"
          >
            <LinkedinIcon className="w-4 h-4 mr-2" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

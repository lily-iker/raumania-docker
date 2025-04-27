'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { NormalFooter } from '@/components/NormalFooter';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill out all fields.');
      return;
    }

    // Handle form logic here
    toast.success('Message sent successfully!');
    setForm({ name: '', email: '', message: '' }); // reset form
  };

  return (
<>
    <Header/>

    <div className="h-24 md:h-32 bg-brand-gray" /> 

    <div className="min-h-screen bg-brand-gray text-brand-purple px-6 py-16">
      {/* Hot Toast Container */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Title */}
      <div className="text-center mb-16">
        <h1
          className={clsx(
            'text-[3rem] md:text-[4rem] font-dancing tracking-tight text-brand-purple drop-shadow-md transition-all duration-700',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
          )}
        >
          Contact Raumania
        </h1>
        <p className="mt-4 text-brand-purple/70 text-base md:text-lg font-light max-w-xl mx-auto">
          Let your story begin with a scent. We’d love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info Cards */}
        <div className="space-y-8">
          {[ 
            { icon: <MapPin />, label: 'Address', value: "Ambatukam's School, Luzon, PH" },
            { icon: <Phone />, label: 'Phone', value: '+63 912 345 6789' },
            { icon: <Mail />, label: 'Email', value: 'support@raumania.com' },
            { icon: <Clock />, label: 'Hours', value: 'Mon–Fri: 9am–6pm' },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-start space-x-4 bg-white text-brand-purple rounded-2xl p-6"
              style={{ border: '2px solid #CC9999', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="text-brand-orange w-6 h-6 mt-1">{icon}</div>
              <div>
                <p className="font-semibold">{label}</p>
                <p className="mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white text-brand-purple rounded-2xl p-8 space-y-6"
          style={{ border: '2px solid #CC9999', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
        >
          {[ 
            { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                name={name}
                type={type}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-brand-purple/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-brand-gray"
                required
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              className="w-full border border-brand-purple/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-brand-gray"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-brand-purple hover:bg-brand-orange rounded-lg transition duration-300"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Map */}
      <div className="mt-16 max-w-6xl mx-auto overflow-hidden rounded-2xl" style={{ border: '2px solid #CC9999', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3814.4551929393115!2d120.87141307603844!3d17.050373083780396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x338e2d00305e5aed%3A0xc09cd76ca3d4be47!2sAmbatukam's%20school!5e0!3m2!1svi!2s!4v1745169624662!5m2!1svi!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
    <NormalFooter/>
    </>
  );
}

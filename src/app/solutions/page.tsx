'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users, Building2, Briefcase, GraduationCap, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';

const SolutionsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Who Can Use <span className="text-primary">Proddy</span>?
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Proddy is designed to serve diverse teams across various industries with its modular, AI-powered productivity suite.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Solution Card 1 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Startups & Small Teams</h3>
              <p className="text-gray-600 mb-6">
                Streamline communication and project management with an all-in-one solution that grows with your team.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Affordable pricing for growing teams</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Quick setup with minimal configuration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Modular approach to add features as needed</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </motion.div>

            {/* Solution Card 2 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Building2 className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Mid-Size Businesses</h3>
              <p className="text-gray-600 mb-6">
                Enhance cross-department collaboration with integrated tools that keep everyone aligned.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Scalable infrastructure for growing teams</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced reporting and analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Customizable workflows and integrations</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </motion.div>

            {/* Solution Card 3 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Briefcase className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enterprise Organizations</h3>
              <p className="text-gray-600 mb-6">
                Secure, compliant, and customizable platform for large-scale team coordination.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Enterprise-grade security and compliance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced admin controls and permissions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dedicated support and custom implementation</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button className="w-full">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </motion.div>

            {/* Solution Card 4 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <GraduationCap className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Educational Institutions</h3>
              <p className="text-gray-600 mb-6">
                Foster collaboration between faculty and students with intuitive tools for learning.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Special pricing for educational institutions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Tools designed for classroom collaboration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Privacy features for student data protection</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </motion.div>

            {/* Solution Card 5 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
                <Heart className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Non-Profit Organizations</h3>
              <p className="text-gray-600 mb-6">
                Maximize your impact with affordable tools that help coordinate volunteers and projects.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Discounted plans for non-profit organizations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Volunteer coordination and management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Donor and fundraising campaign tracking</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button className="w-full">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your team's productivity?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Join thousands of teams already using Proddy to streamline their workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">Get Started for Free</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SolutionsPage;

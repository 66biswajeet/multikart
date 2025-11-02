'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Alert, Spinner } from 'reactstrap';

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [setupInfo, setSetupInfo] = useState(null);
  const [error, setError] = useState(null);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup-admin');
      const data = await response.json();
      
      if (data.success) {
        setSetupInfo(data.data);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  // Check setup status on component mount
  useEffect(() => {
    checkSetupStatus();
  }, []);

 

  const createSuperAdmin = async (forceReset = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceReset }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setSetupInfo(data.data);
      } else {
        setError(data.message || 'Failed to create super admin');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <CardHeader className="bg-primary text-white">
              <h4 className="mb-0">🛠️ Super Admin Setup</h4>
            </CardHeader>
            <CardBody>
              
              {/* Setup Status */}
              {setupInfo && (
                <Alert color={setupInfo.is_setup ? "success" : "warning"}>
                  <strong>Setup Status:</strong>{' '}
                  {setupInfo.is_setup ? (
                    <>
                      ✅ Super admin is already configured
                      <br />
                      <small>
                        Admin: {setupInfo.setup_info?.admin_name} ({setupInfo.admin_email})
                        <br />
                        Created: {new Date(setupInfo.setup_info?.created_at).toLocaleString()}
                        <br />
                        Permissions: {setupInfo.setup_info?.permissions_count} total
                      </small>
                    </>
                  ) : (
                    "⚠️ Super admin not configured"
                  )}
                </Alert>
              )}

              {/* Success Message */}
              {status === 'success' && setupInfo && (
                <Alert color="success">
                  <h5>🎉 Super Admin Created Successfully!</h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h6>👤 Admin Details:</h6>
                      <ul className="list-unstyled">
                        <li><strong>Name:</strong> {setupInfo.admin?.name}</li>
                        <li><strong>Email:</strong> {setupInfo.admin?.email}</li>
                        <li><strong>Role:</strong> {setupInfo.role?.display_name}</li>
                        <li><strong>Permissions:</strong> {setupInfo.role?.permissions_count}</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>🔑 Login Credentials:</h6>
                      <div className="bg-light p-3 rounded">
                        <strong>Email:</strong> {setupInfo.credentials?.email}<br />
                        <strong>Password:</strong> <code>{setupInfo.credentials?.password}</code>
                      </div>
                      <small className="text-warning">
                        ⚠️ Please change this password after first login!
                      </small>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert color="danger">
                  <strong>❌ Error:</strong> {error}
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="text-center">
                {!setupInfo?.is_setup ? (
                  <Button
                    color="primary"
                    size="lg"
                    onClick={() => createSuperAdmin(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Super Admin...
                      </>
                    ) : (
                      '🚀 Create Super Admin'
                    )}
                  </Button>
                ) : (
                  <div>
                    <p className="text-success mb-3">
                      ✅ Super admin is already set up and ready to use!
                    </p>
                    <Button
                      color="warning"
                      onClick={() => createSuperAdmin(true)}
                      disabled={isLoading}
                      className="me-2"
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Recreating...
                        </>
                      ) : (
                        '🔄 Recreate Super Admin'
                      )}
                    </Button>
                    <Button
                      color="success"
                      href="/auth/login"
                      tag="a"
                    >
                      🔑 Go to Login
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <hr />
              <div className="mt-4">
                <h6>📋 Instructions:</h6>
                <ol>
                  <li>Click "Create Super Admin" to initialize the admin user in your database</li>
                  <li>Use the provided credentials to log in to the admin panel</li>
                  <li>Change the default password after first login for security</li>
                  <li>The super admin will have access to all features and permissions</li>
                </ol>
              </div>

              {/* Database Info */}
              <Alert color="info" className="mt-3">
                <strong>ℹ️ Database Info:</strong>
                <br />
                This will create the super admin user directly in your MongoDB database.
                The user will have all available permissions and can manage the entire application.
              </Alert>

            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}